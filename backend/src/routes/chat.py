from fastapi import APIRouter, HTTPException, Depends
import openai
import os
import requests
import json
import logging
from pydantic import BaseModel
from typing import List, Optional, Dict, Literal, Union

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("chat_api")

router = APIRouter()

# --- Environment Variable Check --- 
def get_openai_api_key():
    api_key = os.environ.get("OPENAI_API_KEY") 
    if not api_key:
        logger.error("OPENAI_API_KEY environment variable not set.")
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable not set.")
    logger.info(f"API key successfully loaded (length: {len(api_key)})")
    return api_key

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    document: str
    model: Optional[str] = "deepseek" # Default to deepseek
    language: Optional[str] = "zh"

class ChatResponse(BaseModel):
    content: str
    model_used: str

# 提示词设置
@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, api_key: str = Depends(get_openai_api_key)):
    try:
        logger.info(f"Received chat request for model: {request.model}")
        
        system_prompt_content = f'''
        你是一个专业的文档分析师和内容解读专家。请仔细分析提供的文档内容，并根据用户的问题提供详细、准确的回答。

        ## 分析任务指导：
        1. **仔细阅读文档**：理解文档的完整内容和上下文
        2. **深度分析**：不仅要回答直接信息，也要进行合理的推理和分析
        3. **详细回答**：提供丰富的细节和背景信息
        4. **多角度思考**：从不同维度分析问题
        5. **如果信息不足**：明确说明缺失的信息，并建议可能的补充方向

        ## 文档内容：
        --- 文档开始 ---
        {request.document}
        --- 文档结束 ---

        ## 回答要求：
        - 使用中文回答
        - 提供详细的分析和解释
        - 引用具体的文档内容支持你的回答
        - 如果文档中没有直接答案，请分析可能的原因并提供相关建议
        - 回答要有逻辑性和结构性
        '''
        
        # Prepare messages for API
        messages_for_api = [
            {"role": "system", "content": system_prompt_content}
        ]
        for msg in request.messages:
            if msg.role != 'system': # Exclude any system messages from history
                messages_for_api.append({"role": msg.role, "content": msg.content})
        
        # 根据模型类型选择不同的处理方式
        model_to_use = request.model
        logger.info(f"Processing model: {model_to_use}")
        
        # 检查模型是否使用Ollama
        if model_to_use and (model_to_use.startswith('llama') or 
                            model_to_use.startswith('qwen') or 
                            model_to_use == 'llama2'):
            # 使用Ollama API
            logger.info(f"Using Ollama API for model: {model_to_use}")
            return await process_ollama_request(model_to_use, messages_for_api)
        else:
            # 使用OpenAI兼容API（用于DeepSeek或OpenAI模型）
            logger.info(f"Using OpenAI compatible API for model: {model_to_use}")
            return await process_openai_request(model_to_use, messages_for_api, api_key)
            
    except Exception as e:
        error_msg = f"Chat API Error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)

# 处理OpenAI兼容API的请求（DeepSeek或OpenAI）
async def process_openai_request(model: str, messages: List[Dict], api_key: str) -> ChatResponse:
    try:
        # 根据模型名称进行映射
        if model == "deepseek":
            model_to_use = "deepseek-chat"  # DeepSeek的模型名
            base_url = "https://api.deepseek.com"  # DeepSeek的API URL
            logger.info(f"Using DeepSeek API with model: {model_to_use}")
        elif model.startswith("gpt-"):
            model_to_use = model  # 原样保留GPT模型名称
            base_url = "https://api.openai.com/v1"  # OpenAI的API URL
            logger.info(f"Using OpenAI API with model: {model_to_use}")
        else:
            model_to_use = model  # 默认使用原始模型名
            base_url = "https://api.deepseek.com"  # 默认使用DeepSeek
            logger.info(f"Using default base URL with model: {model_to_use}")
        
        # 使用OpenAI客户端
        logger.info(f"Initializing OpenAI client with base_url: {base_url}")
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        
        # 调用API
        logger.info(f"Sending request to {base_url} with model {model_to_use}")
        chat_completion = client.chat.completions.create(
            model=model_to_use,
            messages=messages,
            temperature=0.8,  # 稍微提高创造性
            max_tokens=8000 if "deepseek" in model_to_use else 32768,  # 增加DeepSeek的token限制
            top_p=0.95,  # 添加top_p参数提高回答质量
        )
        
        assistant_reply = chat_completion.choices[0].message.content
        logger.info(f"Received response from model {model_to_use} (length: {len(assistant_reply)})")
        
        return ChatResponse(
            content=assistant_reply.strip(),
            model_used=model_to_use
        )
    except openai.APIError as e:
        error_msg = f"OpenAI API Error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=e.status_code or 500, detail=f"AI service error: {str(e)}")
    except Exception as e:
        error_msg = f"Unexpected error with {model} model: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)

# 处理Ollama API请求
async def process_ollama_request(model: str, messages: List[Dict], base_url: str = "http://localhost:11434") -> ChatResponse:
    try:
        # 准备Ollama API请求
        ollama_endpoint = f"{base_url}/api/chat"
        logger.info(f"Sending request to Ollama at {ollama_endpoint} with model {model}")
        
        # Ollama API请求体
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,  # 修改为False，使用非流式响应
            "options": {
                "temperature": 0.8,  # 稍微提高创造性
                "top_p": 0.95,  # 添加top_p参数
                "num_ctx": 8192,  # 增加上下文长度
                "num_predict": 2048  # 增加预测长度
            }
        }
        
        logger.info(f"Ollama request payload: {json.dumps(payload)}")
        
        # 发送请求到Ollama
        response = requests.post(ollama_endpoint, json=payload)
        
        if response.status_code != 200:
            error_msg = f"Ollama API returned error {response.status_code}: {response.text}"
            logger.error(error_msg)
            raise HTTPException(
                status_code=response.status_code, 
                detail=error_msg
            )
        
        # 解析响应
        response_data = response.json()
        logger.info(f"Ollama response structure: {list(response_data.keys())}")
        
        # 正确提取内容，处理不同的响应格式
        assistant_reply = ""
        if "message" in response_data and isinstance(response_data["message"], dict):
            assistant_reply = response_data["message"].get("content", "")
        elif "response" in response_data:
            # 某些版本的Ollama可能使用response字段
            assistant_reply = response_data.get("response", "")
        
        if not assistant_reply:
            error_msg = f"Ollama returned empty response, full response: {json.dumps(response_data)}"
            logger.error(error_msg)
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )
        
        logger.info(f"Received response from Ollama model {model} (length: {len(assistant_reply)})")
        return ChatResponse(
            content=assistant_reply.strip(),
            model_used=f"ollama/{model}"
        )
    except requests.RequestException as e:
        error_msg = f"Ollama API Error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(
            status_code=503, 
            detail=f"Ollama服务连接失败，请确保Ollama正在运行: {str(e)}"
        )

@router.post("/tasks/{task_uuid}/convert-srt-to-ass")
async def convert_srt_to_ass_endpoint(task_uuid: str):
    """实时转换SRT为ASS用于前端渲染"""
    try:
        from pathlib import Path
        from fastapi.responses import Response
        import tempfile
        import os
        
        # 获取任务目录
        task_dir = DATA_DIR / task_uuid
        if not task_dir.exists():
            raise HTTPException(status_code=404, detail="Task not found")
        
        # 查找SRT文件
        srt_files = list(task_dir.glob("*.srt"))
        if not srt_files:
            raise HTTPException(status_code=404, detail="No SRT file found")
        
        srt_file_path = srt_files[0]  # 使用第一个SRT文件
        
        # 创建临时ASS文件
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.ass', delete=False, encoding='utf-8') as temp_ass:
            temp_ass_path = temp_ass.name
        
        try:
            # 调用现有的转换函数，不使用segments（完整转换）
            from ..main import convert_srt_to_ass_simple
            success = convert_srt_to_ass_simple(str(srt_file_path), temp_ass_path)
            
            if not success:
                raise HTTPException(status_code=500, detail="Failed to convert SRT to ASS")
            
            # 读取ASS文件内容
            with open(temp_ass_path, 'r', encoding='utf-8') as f:
                ass_content = f.read()
            
            # 清理临时文件
            os.unlink(temp_ass_path)
            
            # 返回ASS内容
            return Response(
                content=ass_content,
                media_type="text/plain",
                headers={"Content-Disposition": f"attachment; filename={task_uuid}.ass"}
            )
            
        except Exception as e:
            # 确保清理临时文件
            if os.path.exists(temp_ass_path):
                os.unlink(temp_ass_path)
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting SRT to ASS: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
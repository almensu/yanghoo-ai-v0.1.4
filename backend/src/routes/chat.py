from fastapi import APIRouter, HTTPException, Depends
import openai
import os
import requests
import json
import logging
from pydantic import BaseModel
from typing import List, Optional, Dict, Literal, Union
from google import genai
from google.genai import types
from pathlib import Path

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

def get_gemini_api_key():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not set.")
        raise HTTPException(status_code=400, detail="请设置 GEMINI_API_KEY 环境变量或选择其他模型")
    logger.info(f"Gemini API key successfully loaded (length: {len(api_key)})")
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
        
        # 检查模型是否使用Gemini
        if model_to_use and model_to_use.startswith('gemini'):
            # 使用Gemini API
            logger.info(f"Using Gemini API for model: {model_to_use}")
            return await process_gemini_request(model_to_use, messages_for_api)
        # 检查模型是否使用Ollama
        elif model_to_use and (model_to_use.startswith('llama') or 
                            model_to_use.startswith('qwen') or 
                            model_to_use.startswith('deepseek-r1') or
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

# 处理Gemini API请求
async def process_gemini_request(model: str, messages: List[Dict]) -> ChatResponse:
    try:
        # 验证Gemini API Key
        gemini_api_key = get_gemini_api_key()
        
        # 设置环境变量（确保google.genai能够获取到API key）
        os.environ["GEMINI_API_KEY"] = gemini_api_key
        
        logger.info(f"Using Gemini API for model: {model}")
        
        # 初始化Gemini客户端
        client = genai.Client()
        
        # 将消息转换为Gemini格式并检查长度
        contents = []
        total_length = 0
        
        for msg in messages:
            if msg["role"] == "system":
                content = f"System: {msg['content']}"
            elif msg["role"] == "user":
                content = f"User: {msg['content']}"
            elif msg["role"] == "assistant":
                content = f"Assistant: {msg['content']}"
            
            contents.append(content)
            total_length += len(content)
        
        # 合并所有内容为一个字符串
        combined_content = "\n\n".join(contents)
        
        # 检查内容长度，如果太长则进行分块处理
        max_content_length = 100000  # 约100K字符限制
        if len(combined_content) > max_content_length:
            logger.warning(f"Content too long ({len(combined_content)} chars), attempting document chunking")
            return await process_gemini_with_chunking(client, model, messages, max_content_length)
        
        # 使用重试机制调用Gemini API
        return await call_gemini_with_retry(client, model, combined_content, max_retries=3)
        
    except Exception as e:
        error_msg = f"Gemini API Error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # 检查是否是过载错误，如果是则建议降级
        if "503" in str(e) or "overloaded" in str(e).lower() or "UNAVAILABLE" in str(e):
            raise HTTPException(
                status_code=503, 
                detail=f"Gemini服务过载，请稍后重试或切换到其他模型（如 DeepSeek 或 Ollama 模型）: {str(e)}"
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Gemini服务错误: {str(e)}"
            )

# 新增：带重试机制的Gemini调用
async def call_gemini_with_retry(client, model: str, content: str, max_retries: int = 3) -> ChatResponse:
    import asyncio
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Gemini API attempt {attempt + 1}/{max_retries} for model {model}")
            
            # 调用Gemini API，为2.5 Pro启用思考模式
            if "2.5" in model.lower() and "pro" in model.lower():
                # Gemini 2.5 Pro 需要启用思考模式，但减少thinking_budget以降低负载
                response = client.models.generate_content(
                    model=model,
                    contents=content,
                    config=types.GenerateContentConfig(
                        thinking_config=types.ThinkingConfig(thinking_budget=512),  # 减少思考预算
                        temperature=0.7,  # 稍微降低温度
                        max_output_tokens=6144  # 减少输出token数
                    ),
                )
            else:
                # 其他Gemini模型禁用思考模式
                response = client.models.generate_content(
                    model=model,
                    contents=content,
                    config=types.GenerateContentConfig(
                        thinking_config=types.ThinkingConfig(thinking_budget=0),  # 禁用思考
                        temperature=0.7,
                        max_output_tokens=6144
                    ),
                )
            
            assistant_reply = response.text
            
            if not assistant_reply:
                error_msg = "Gemini returned empty response"
                logger.error(error_msg)
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=500, detail=error_msg)
                continue
            
            logger.info(f"Received response from Gemini model {model} (length: {len(assistant_reply)})")
            
            return ChatResponse(
                content=assistant_reply.strip(),
                model_used=f"gemini/{model}"
            )
            
        except Exception as e:
            error_str = str(e)
            logger.warning(f"Gemini API attempt {attempt + 1} failed: {error_str}")
            
            # 检查是否是过载错误
            if ("503" in error_str or "overloaded" in error_str.lower() or 
                "UNAVAILABLE" in error_str or "quota" in error_str.lower()):
                
                if attempt < max_retries - 1:
                    # 指数退避：等待时间递增
                    wait_time = (2 ** attempt) * 2  # 2, 4, 8 秒
                    logger.info(f"Service overloaded, waiting {wait_time} seconds before retry...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # 最后一次尝试失败，抛出带建议的错误
                    raise HTTPException(
                        status_code=503,
                        detail=f"Gemini 2.5 Pro 服务过载，已重试 {max_retries} 次。建议：1) 稍后重试 2) 减少文档长度 3) 切换到 DeepSeek 或 Ollama 模型"
                    )
            else:
                # 非过载错误，直接抛出
                if attempt == max_retries - 1:
                    raise e
                continue

# 新增：文档分块处理
async def process_gemini_with_chunking(client, model: str, messages: List[Dict], max_chunk_size: int) -> ChatResponse:
    """当文档过长时，将其分块处理"""
    
    # 分离系统消息（包含文档）和对话历史
    system_messages = [msg for msg in messages if msg["role"] == "system"]
    conversation_messages = [msg for msg in messages if msg["role"] != "system"]
    
    if not system_messages:
        # 没有系统消息，直接处理
        combined_content = "\n\n".join([f"{msg['role'].title()}: {msg['content']}" for msg in messages])
        return await call_gemini_with_retry(client, model, combined_content, max_retries=3)
    
    # 提取文档内容
    system_content = system_messages[0]["content"]
    
    # 查找文档部分
    doc_start = system_content.find("--- 文档开始 ---")
    doc_end = system_content.find("--- 文档结束 ---")
    
    if doc_start == -1 or doc_end == -1:
        # 没有找到文档标记，按原方式处理
        combined_content = "\n\n".join([f"{msg['role'].title()}: {msg['content']}" for msg in messages])
        return await call_gemini_with_retry(client, model, combined_content, max_retries=3)
    
    # 提取文档内容和系统提示
    system_prompt_prefix = system_content[:doc_start]
    document_content = system_content[doc_start + len("--- 文档开始 ---"):doc_end]
    system_prompt_suffix = system_content[doc_end + len("--- 文档结束 ---"):]
    
    # 如果文档仍然太长，进行摘要处理
    if len(document_content) > max_chunk_size * 0.7:  # 留出空间给其他内容
        logger.info(f"Document too long ({len(document_content)} chars), creating summary")
        
        # 创建文档摘要
        summary_prompt = f"""请为以下文档创建一个详细摘要，保留关键信息和结构：

{document_content[:max_chunk_size//2]}

摘要要求：
1. 保留文档的主要内容和结构
2. 包含重要的细节和数据
3. 使用中文
4. 长度控制在原文档的1/3左右"""

        try:
            summary_response = await call_gemini_with_retry(client, model, summary_prompt, max_retries=2)
            document_summary = summary_response.content
            logger.info(f"Created document summary (length: {len(document_summary)})")
        except Exception as e:
            logger.warning(f"Failed to create summary: {e}, using truncated document")
            document_summary = document_content[:max_chunk_size//2] + "\n\n[文档已截断...]"
        
        # 使用摘要替换原文档
        modified_system_content = f"""{system_prompt_prefix}
--- 文档开始 ---
{document_summary}
--- 文档结束 ---
{system_prompt_suffix}"""
    else:
        modified_system_content = system_content
    
    # 重新构建消息
    final_messages = [{"role": "system", "content": modified_system_content}] + conversation_messages
    combined_content = "\n\n".join([f"{msg['role'].title()}: {msg['content']}" for msg in final_messages])
    
    return await call_gemini_with_retry(client, model, combined_content, max_retries=3)

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

# 新增：获取任务列表的API
@router.get("/api/tasks")
async def get_tasks():
    """获取所有任务目录列表"""
    try:
        from ..data_management import DATA_DIR
        
        if not DATA_DIR.exists():
            return {"tasks": []}
        
        tasks = []
        for task_dir in DATA_DIR.iterdir():
            if task_dir.is_dir() and not task_dir.name.startswith('.'):
                # 获取任务的基本信息
                task_info = {
                    "uuid": task_dir.name,
                    "name": task_dir.name,
                    "path": str(task_dir),
                    "created_time": task_dir.stat().st_ctime if task_dir.exists() else None
                }
                
                # 检查是否有info.json文件获取更多信息
                info_file = task_dir / "info.json"
                if info_file.exists():
                    try:
                        with open(info_file, 'r', encoding='utf-8') as f:
                            info_data = json.load(f)
                            task_info["title"] = info_data.get("title", task_dir.name)
                            task_info["description"] = info_data.get("description", "")
                            task_info["url"] = info_data.get("url", "")
                    except Exception as e:
                        logger.warning(f"Failed to read info.json for task {task_dir.name}: {e}")
                
                tasks.append(task_info)
        
        # 按创建时间排序，最新的在前
        tasks.sort(key=lambda x: x.get("created_time", 0), reverse=True)
        
        return {"tasks": tasks}
        
    except Exception as e:
        logger.error(f"Error getting tasks: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# 新增：获取任务文档列表的API
@router.get("/api/tasks/{task_uuid}/documents")
async def get_task_documents(task_uuid: str):
    """获取指定任务的文档列表"""
    try:
        from ..data_management import DATA_DIR
        
        task_dir = DATA_DIR / task_uuid
        if not task_dir.exists():
            raise HTTPException(status_code=404, detail="Task not found")
        
        documents = []
        
        # 获取所有markdown文件
        for md_file in task_dir.glob("*.md"):
            if md_file.is_file():
                try:
                    # 读取文件内容来计算大小和预览
                    with open(md_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 获取文件的前几行作为预览
                    preview_lines = content.split('\n')[:3]
                    preview = '\n'.join(preview_lines)
                    if len(content.split('\n')) > 3:
                        preview += '\n...'
                    
                    doc_info = {
                        "filename": md_file.name,
                        "path": str(md_file.relative_to(task_dir)),
                        "size": len(content),
                        "lines": len(content.split('\n')),
                        "preview": preview[:200],  # 限制预览长度
                        "modified_time": md_file.stat().st_mtime,
                        "type": "markdown"
                    }
                    documents.append(doc_info)
                    
                except Exception as e:
                    logger.warning(f"Failed to read file {md_file}: {e}")
                    # 即使读取失败也添加基本信息
                    documents.append({
                        "filename": md_file.name,
                        "path": str(md_file.relative_to(task_dir)),
                        "size": 0,
                        "lines": 0,
                        "preview": "[无法读取文件内容]",
                        "modified_time": md_file.stat().st_mtime,
                        "type": "markdown",
                        "error": True
                    })
        
        # 按修改时间排序，最新的在前
        documents.sort(key=lambda x: x.get("modified_time", 0), reverse=True)
        
        return {
            "task_uuid": task_uuid,
            "documents": documents,
            "total": len(documents)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting documents for task {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# 新增：获取文档内容的API（用于"@"功能）
@router.get("/api/tasks/{task_uuid}/documents/{filename}/content")
async def get_document_content(task_uuid: str, filename: str):
    """获取指定文档的完整内容"""
    try:
        from ..data_management import DATA_DIR
        
        task_dir = DATA_DIR / task_uuid
        if not task_dir.exists():
            raise HTTPException(status_code=404, detail="Task not found")
        
        doc_path = task_dir / filename
        if not doc_path.exists() or not doc_path.is_file():
            raise HTTPException(status_code=404, detail="Document not found")
        
        # 安全检查：确保文件在任务目录内
        if not str(doc_path.resolve()).startswith(str(task_dir.resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
        
        try:
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "filename": filename,
                "content": content,
                "size": len(content),
                "lines": len(content.split('\n')),
                "encoding": "utf-8"
            }
            
        except UnicodeDecodeError:
            # 尝试其他编码
            try:
                with open(doc_path, 'r', encoding='gbk') as f:
                    content = f.read()
                return {
                    "filename": filename,
                    "content": content,
                    "size": len(content),
                    "lines": len(content.split('\n')),
                    "encoding": "gbk"
                }
            except:
                raise HTTPException(status_code=400, detail="Cannot decode file content")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document content: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
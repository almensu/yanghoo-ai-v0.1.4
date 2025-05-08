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

@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, api_key: str = Depends(get_openai_api_key)):
    try:
        logger.info(f"Received chat request for model: {request.model}")
        
        system_prompt_content = f'''
        You are a helpful AI assistant. Please respond in Chinese.
        The user is asking questions about the following document content. Base your answers on this document:
        --- DOCUMENT START ---
        {request.document[:500]}... (truncated for log)
        --- DOCUMENT END ---
        Keep your answers concise and directly related to the document.
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
            temperature=0.7,
            max_tokens=2000,
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
                "temperature": 0.7
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
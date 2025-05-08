import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MarkdownViewer from './MarkdownViewer'; // Assuming MarkdownViewer is in the same directory

function AIChat({ markdownContent, apiBaseUrl }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [availableModels, setAvailableModels] = useState([
    { id: 'deepseek', name: 'DeepSeek AI' },
    { id: 'qwen3:14b', name: 'Ollama - qwen3:14b' },
    { id: 'qwen3:0.6b', name: 'Ollama - qwen3:0.6b' },
    //{ id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    setMessages([
      { role: 'system', content: '我可以帮您分析和讨论文档内容，请随时提问。' }
    ]);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setDebugInfo(null);
    setRawResponse(null);
    
    try {
      const chatApiUrl = `${apiBaseUrl}/api/chat`;
      console.log("Sending chat request to:", chatApiUrl);
      
      const payload = {
        messages: [...messages, userMessage],
        document: markdownContent || "No document provided.",
        model: selectedModel,
        language: 'zh'
      };
      
      console.log("Payload:", payload);

      const response = await axios.post(chatApiUrl, payload);
      
      console.log("Response received:", response.data);
      setRawResponse(response.data);
      
      if (response.data && response.data.content) {
        console.log("Content received:", response.data.content);
        console.log("Content type:", typeof response.data.content);
        console.log("Content preview:", response.data.content.substring(0, 50));
        
        const assistantMessage = { 
          role: 'assistant', 
          content: response.data.content 
        };
        
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          console.log("Updated messages state:", newMessages);
          return newMessages;
        });
        
        setDebugInfo({
          status: 'success',
          model: response.data.model_used,
          contentLength: response.data.content.length,
          contentPreview: response.data.content.substring(0, 50) + '...'
        });
      } else {
        console.error('Response is missing content:', response.data);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '抱歉，服务器返回了空响应。请检查您的请求和服务器日志。' 
        }]);
        setDebugInfo({
          status: 'error',
          error: 'Empty response content',
          response: JSON.stringify(response.data)
        });
      }
    } catch (error) {
      console.error('聊天请求失败:', error.response ? error.response.data : error.message);
      
      let errorMessage = '抱歉，发生了错误: ';
      
      if (error.response) {
        errorMessage += `服务器错误 (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data) || error.message}`;
        setDebugInfo({
          status: 'error',
          httpStatus: error.response.status,
          error: error.response.data?.detail || error.message,
          data: JSON.stringify(error.response.data)
        });
      } else if (error.request) {
        errorMessage += `没有收到服务器响应，请检查服务器是否运行。`;
        setDebugInfo({
          status: 'error',
          error: 'No response from server',
          message: error.message
        });
      } else {
        errorMessage += error.message;
        setDebugInfo({
          status: 'error',
          error: 'Request setup error',
          message: error.message
        });
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* 顶部模型选择栏 */}
      <div className="p-3 border-b flex items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <span className="text-sm font-medium text-gray-700 mr-2">选择AI模型:</span>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="select select-sm select-bordered focus:ring-2 focus:ring-blue-500 transition-all"
          disabled={isLoading}
        >
          {availableModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center">
          {isLoading ? (
            <div className="flex items-center text-xs text-indigo-600">
              <span className="loading loading-dots loading-xs mr-1"></span>
              处理中...
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-600">
                {`${availableModels.find(m => m.id === selectedModel)?.name || selectedModel}`}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* 调试信息面板 */}
      {debugInfo && (
        <div 
          className={`text-xs p-2 transition-all duration-300 ${
            debugInfo.status === 'success' 
              ? 'bg-green-50 text-green-700 border-b border-green-100' 
              : 'bg-red-50 text-red-700 border-b border-red-100'
          }`}
        >
          <div className="font-semibold">调试信息:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {/* 原始响应查看器 */}
      {rawResponse && (
        <div className="text-xs p-2 bg-gray-50 border-b border-gray-200 overflow-auto max-h-36">
          <details>
            <summary className="font-semibold cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
              查看原始响应
            </summary>
            <pre className="whitespace-pre-wrap mt-1 text-gray-700 p-2 rounded bg-gray-100">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {/* 聊天消息区 */}
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white"
        style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(200, 200, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(200, 200, 255, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px'
        }}
      >
        {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`relative max-w-4xl p-4 rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-2'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 ml-2'
              } animate-fadeIn`}
              style={{
                animationDelay: `${0.1 * index}s`,
                boxShadow: msg.role === 'user' 
                  ? '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* 添加气泡尖角 */}
              <div 
                className={`absolute top-4 ${msg.role === 'user' ? 'right-0 transform translate-x-1/2 rotate-45' : 'left-0 transform -translate-x-1/2 rotate-45'} w-3 h-3 ${
                  msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              ></div>
              
              {/* 角色标识 */}
              <div className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {msg.role === 'user' ? '您' : 'AI 助手'}
              </div>
              
              {/* 消息内容 */}
              {msg.content ? (
                <div className="markdown-content break-words">
                  <div className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                    <MarkdownViewer 
                      markdown={msg.content} 
                      className={msg.role === 'user' ? 'prose-invert' : ''}
                    />
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="text-xxs text-gray-400 mt-2 text-right">
                      {`${new Date().toLocaleTimeString()} · ${msg.content.length} 字符`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-500 italic">无内容显示或加载。</div>
              )}
            </div>
          </div>
        ))}
        
        {/* 加载中动画 */}
        {isLoading && (
          <div className="flex items-start ml-2 mt-6">
            <div className="bg-gray-100 rounded-xl p-3 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* 如果没有消息，显示欢迎信息 */}
        {messages.filter(msg => msg.role !== 'system').length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-lg font-semibold text-gray-400 animate-pulse">
              欢迎使用AI对话助手
            </div>
            <div className="text-sm text-gray-400 mt-2 text-center">
              请在下方输入您的问题或指令
            </div>
          </div>
        )}
      </div>
      
      {/* 输入区域 */}
      <div className="border-t p-3 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex gap-2 items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="按 Shift+Enter 换行，按 Enter 发送..."
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm"
            style={{ minHeight: '60px' }}
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            className="btn btn-primary h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          使用{availableModels.find(m => m.id === selectedModel)?.name}进行回答
        </div>
      </div>
    </div>
  );
}

// 添加必要的CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .text-xxs {
    font-size: 0.65rem;
  }
`;
document.head.appendChild(style);

export default AIChat; 
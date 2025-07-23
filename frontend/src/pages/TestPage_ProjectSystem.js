import React, { useState } from 'react';
import ProjectBasket from '../components/ProjectBasket';
import CrossTaskBrowser from '../components/CrossTaskBrowser';
import AIChat from '../components/AIChat';
import BlockEditor from '../components/BlockEditor';
import { useToast } from '../components/Toast';
import { testProjectManager, cleanupTestData } from '../utils/testProjectManager';

const TestPage_ProjectSystem = () => {
  const [currentView, setCurrentView] = useState('browser');
  const [apiBaseUrl] = useState('http://localhost:8000'); // 根据实际后端地址调整
  const [taskUuid] = useState('test-task-uuid'); // 测试用的任务UUID
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  const mockMarkdownContent = `# 测试文档

## 介绍
这是一个测试文档，用于演示项目系统的功能。

## 核心概念
项目系统允许用户从多个视频任务中收集有用的内容块和文档，组合成一个项目，然后发送给AI进行分析。

### 主要功能
1. **跨任务浏览** - 浏览不同任务的文档和块
2. **项目收集** - 将有用的内容添加到项目篮中
3. **AI分析** - 将整个项目作为上下文发送给AI
4. **导出功能** - 支持Newsletter和Markdown格式导出

## 使用流程
1. 创建或选择一个项目
2. 浏览任务，选择有用的块和文档
3. 收集到项目篮中
4. 发送给AI进行分析
5. 导出结果

## 技术实现
- 使用localStorage存储项目数据
- 支持[[blockId]]引用语法
- Newsletter模板导出
- 跨组件状态管理`;

  const handleBlockCollected = (projectId, blockItem) => {
    console.log('Block collected:', { projectId, blockItem });
    showSuccess(`块已收集到项目中`);
  };

  const handleDocumentCollected = (projectId, documentItem) => {
    console.log('Document collected:', { projectId, documentItem });
    showSuccess(`文档已收集到项目中`);
  };

  const handleProjectSentToAI = (project) => {
    console.log('Project sent to AI:', project);
    showInfo(`项目"${project.name}"已发送到AI Chat`);
  };

  // 测试功能
  const runTests = async () => {
    showInfo('开始运行测试...');
    try {
      const success = testProjectManager();
      if (success) {
        showSuccess('所有测试通过！');
      } else {
        showError('测试失败，请检查控制台');
      }
    } catch (error) {
      showError('测试运行出错：' + error.message);
    }
  };

  const cleanupTests = async () => {
    try {
      const success = cleanupTestData();
      if (success) {
        showSuccess('测试数据清理完成');
      } else {
        showError('清理失败，请检查控制台');
      }
    } catch (error) {
      showError('清理出错：' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">项目系统测试页面</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('browser')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'browser' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              跨任务浏览器
            </button>
            <button
              onClick={() => setCurrentView('editor')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'editor' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              块编辑器
            </button>
            <button
              onClick={() => setCurrentView('chat')}
              className={`px-4 py-2 rounded-lg ${
                currentView === 'chat' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              AI Chat
            </button>
            
            {/* 测试按钮 */}
            <div className="ml-4 flex gap-2">
              <button
                onClick={runTests}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                运行测试
              </button>
              <button
                onClick={cleanupTests}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                清理数据
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
          
          {currentView === 'browser' && (
            <CrossTaskBrowser
              apiBaseUrl={apiBaseUrl}
              onBlockCollected={handleBlockCollected}
              onDocumentCollected={handleDocumentCollected}
            />
          )}

          {currentView === 'editor' && (
            <div className="flex h-full">
              <div className="flex-1">
                <BlockEditor
                  markdownContent={mockMarkdownContent}
                  onContentChange={(newContent) => {
                    console.log('Content changed:', newContent);
                  }}
                  taskUuid={taskUuid}
                  apiBaseUrl={apiBaseUrl}
                />
              </div>
            </div>
          )}

          {currentView === 'chat' && (
            <AIChat
              markdownContent={mockMarkdownContent}
              apiBaseUrl={apiBaseUrl}
              taskUuid={taskUuid}
            />
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="max-w-7xl mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">使用说明</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-600">1. 跨任务浏览器</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 浏览所有任务的文档和块</li>
                <li>• 搜索特定内容</li>
                <li>• 批量选择和收集</li>
                <li>• 自动添加到当前项目</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600">2. 块编辑器</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 编辑和管理内容块</li>
                <li>• 快速收集按钮</li>
                <li>• 支持[[blockId]]引用</li>
                <li>• 拖拽重排序</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-600">3. AI Chat</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 项目上下文支持</li>
                <li>• 文档引用功能</li>
                <li>• 右侧项目篮管理</li>
                <li>• 一键发送项目给AI</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">注意事项</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 项目数据存储在localStorage中</li>
              <li>• 需要后端API支持才能完整测试</li>
              <li>• 可以在浏览器开发者工具中查看项目数据</li>
              <li>• 支持Newsletter和Markdown格式导出</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast通知容器 */}
      <ToastContainer />
    </div>
  );
};

export default TestPage_ProjectSystem; 
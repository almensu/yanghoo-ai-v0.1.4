import React, { useState } from 'react';
import ProjectBubble from '../components/ProjectBubble';
import { useToast } from '../components/Toast';

const TestPage_ProjectBubble = () => {
  const { showSuccess, showInfo, ToastContainer } = useToast();

  const handleProjectSentToAI = (project) => {
    console.log('Project sent to AI:', project);
    showSuccess(`项目 "${project.name}" 已发送到AI Chat`);
    showInfo(`包含 ${project.selectedBlocks.length} 个块和 ${project.selectedDocuments.length} 个文档`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">项目气泡测试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">功能说明</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 右下角的圆形气泡是项目篮的入口</p>
            <p>• 点击气泡可以展开完整的项目管理面板</p>
            <p>• 气泡上的红色数字显示当前项目中的内容数量</p>
            <p>• 展开后可以创建、切换项目，查看收集的内容</p>
            <p>• 支持发送到AI Chat和导出功能</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">使用步骤</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>点击右下角的气泡图标展开项目篮</li>
            <li>创建一个新项目或选择现有项目</li>
            <li>使用其他组件（如BlockEditor）收集内容到项目中</li>
            <li>在气泡中查看收集的内容</li>
            <li>点击"发送到AI Chat"或导出项目</li>
            <li>点击收起按钮关闭面板</li>
          </ol>
        </div>

        {/* 模拟一些内容区域 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-64">
            <h3 className="font-medium text-blue-800 mb-2">模拟内容区域 1</h3>
            <p className="text-blue-600 text-sm">
              这里可以是BlockEditor、CrossTaskBrowser或其他内容组件。
              用户可以从这些组件中收集有用的内容块到项目篮中。
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-64">
            <h3 className="font-medium text-green-800 mb-2">模拟内容区域 2</h3>
            <p className="text-green-600 text-sm">
              项目气泡设计的优势是不会占用主要的屏幕空间，
              用户可以在需要时快速访问项目功能。
            </p>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 mb-2">⚠️ 注意事项</h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• 气泡使用固定定位，不会影响页面布局</li>
            <li>• 展开的面板有较高的z-index，会覆盖其他内容</li>
            <li>• 支持响应式设计，在小屏幕上自动调整大小</li>
            <li>• 项目数据存储在localStorage中，页面刷新后仍然保持</li>
          </ul>
        </div>
      </div>

      {/* 项目气泡 */}
      <ProjectBubble onSendToAI={handleProjectSentToAI} />
      
      {/* Toast通知 */}
      <ToastContainer />
    </div>
  );
};

export default TestPage_ProjectBubble; 
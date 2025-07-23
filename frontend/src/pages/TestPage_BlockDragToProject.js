import React, { useState } from 'react';
import BlockEditor from '../components/BlockEditor';
import ProjectBubble from '../components/ProjectBubble';

const TestPage_BlockDragToProject = () => {
  const [markdownContent, setMarkdownContent] = useState(`# 测试文档

这是一个测试段落，用于测试拖拽功能。

## 第二个标题

另一个段落，可以拖拽到项目篮中。

### 代码块示例

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

## 列表示例

- 项目一
- 项目二  
- 项目三

> 这是一个引用块，也可以拖拽到项目篮。

最后一个段落，用于测试多块拖拽功能。`);

  const handleContentChange = (newContent) => {
    setMarkdownContent(newContent);
  };

  const handleSendToAI = (project) => {
    console.log('发送项目到AI:', project);
    alert(`项目 "${project.name}" 已发送到AI Chat`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            块拖拽到项目篮测试
          </h1>
          <p className="text-gray-600">
            测试从BlockEditor拖拽块到ProjectBubble的功能
          </p>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">使用说明</h3>
          <ul className="text-blue-800 space-y-1">
            <li>1. 点击BlockEditor中任意块的左侧手柄图标选中块</li>
            <li>2. 拖拽选中的块到右下角的项目篮气泡</li>
            <li>3. 观察拖拽时的视觉反馈（气泡高亮、提示文字）</li>
            <li>4. 松开鼠标完成拖拽，块将被添加到项目篮</li>
            <li>5. 点击项目篮气泡展开查看添加的块</li>
          </ul>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 左侧：BlockEditor */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              块编辑器 (拖拽源)
            </h2>
            <div className="border border-gray-200 rounded-lg">
              <BlockEditor
                markdownContent={markdownContent}
                onContentChange={handleContentChange}
                taskUuid="test-task-uuid"
                apiBaseUrl="http://localhost:8000"
                className="min-h-96"
              />
            </div>
          </div>

          {/* 右侧：说明和状态 */}
          <div className="space-y-6">
            
            {/* 拖拽状态指示 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                拖拽状态
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">
                    项目篮已就绪，可接收拖拽
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">
                    拖拽时气泡会高亮显示
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">
                    支持自动创建项目
                  </span>
                </div>
              </div>
            </div>

            {/* 功能特性 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                功能特性
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>拖拽块到项目篮气泡</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>视觉反馈和提示</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>自动创建项目（如果不存在）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>保留块的完整信息</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>支持收起和展开状态</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 提示：拖拽完成后，可以点击项目篮气泡查看添加的内容
          </p>
        </div>

      </div>

      {/* 项目篮气泡 - 固定在右下角 */}
      <ProjectBubble 
        onSendToAI={handleSendToAI}
        className="fixed bottom-4 right-4"
      />
    </div>
  );
};

export default TestPage_BlockDragToProject; 
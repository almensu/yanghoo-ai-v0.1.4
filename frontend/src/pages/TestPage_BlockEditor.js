import React, { useState } from 'react';
import BlockEditor from '../components/BlockEditor';
import StudioWorkSpaceEnhanced from '../components/StudioWorkSpaceEnhanced';

const TestPage_BlockEditor = () => {
  // 使用真实存在的任务UUID
  const TEST_UUID = 'd6755328-6ad7-48f6-b5ed-4cc1a0cc69ed'; // Steve Jobs Secrets of Life
  
  const [testContent, setTestContent] = useState(`# 测试文档

这是一个测试段落，用来演示块编辑器的功能。

## 代码块示例

\`\`\`javascript
function example() {
  console.log("Hello, World!");
}
\`\`\`

## 列表示例

- 第一个列表项
- 第二个列表项  
- 第三个列表项

## 引用示例

> 这是一个引用块
> 可以包含多行内容

## 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

## 块引用示例

你可以使用 [[block-id]] 来引用其他块，或者使用 @{another-block} 的语法。

这些引用会在块模式中变成可点击的链接。

---

这是一个分隔线上面的段落。

[00:30] 这里有一个时间戳，在Studio中会与视频同步。

最后一个段落，包含一些 **粗体** 和 *斜体* 文本。`);

  const [activeMode, setActiveMode] = useState('workspace'); // 'workspace' 或 'standalone'

  const handleContentChange = (newContent) => {
    setTestContent(newContent);
  };

  return (
    <div className="p-4 min-h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">块编辑器测试页面</h1>
        <p className="text-gray-600 mb-4">
          测试markdown块编辑器的功能，包括块的创建、编辑、移动、删除和引用。
        </p>

        {/* 模式切换 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveMode('workspace')}
            className={`px-4 py-2 rounded ${
              activeMode === 'workspace' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            集成工作区模式
          </button>
          <button
            onClick={() => setActiveMode('standalone')}
            className={`px-4 py-2 rounded ${
              activeMode === 'standalone' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            独立块编辑器
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {activeMode === 'workspace' 
            ? '显示完整的工作区，包含普通模式和块模式切换' 
            : '仅显示块编辑器组件'}
        </div>
      </div>

      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden" style={{ minHeight: '70vh' }}>
        {activeMode === 'workspace' ? (
          <StudioWorkSpaceEnhanced
            taskUuid={TEST_UUID}
            apiBaseUrl="http://127.0.0.1:8000"
            markdownContent={testContent}
            videoRef={null} // 测试页面没有视频
          />
        ) : (
          <BlockEditor
            markdownContent={testContent}
            onContentChange={handleContentChange}
            taskUuid={TEST_UUID}
            apiBaseUrl="http://127.0.0.1:8000"
            className="h-full"
          />
        )}
      </div>

      {/* 调试信息 */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <details>
          <summary className="cursor-pointer font-semibold mb-2">调试信息</summary>
          <div className="space-y-2">
            <div>
              <strong>当前模式:</strong> {activeMode}
            </div>
            <div>
              <strong>测试UUID:</strong> {TEST_UUID} (Steve Jobs Secrets of Life)
            </div>
            <div>
              <strong>内容长度:</strong> {testContent.length} 字符
            </div>
            <div>
              <strong>markdown内容预览:</strong>
              <pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto max-h-32">
                {testContent.substring(0, 500)}
                {testContent.length > 500 && '...'}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TestPage_BlockEditor; 
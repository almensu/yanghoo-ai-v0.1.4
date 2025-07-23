import React, { useRef } from 'react';
import StudioWorkSpace from '../components/StudioWorkSpace';

const TestPage_StudioWorkSpace = () => {
  const videoRef = useRef(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">StudioWorkSpace 展开功能测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">功能说明</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 点击右上角的箭头按钮可以展开/收缩 StudioWorkSpace</p>
            <p>• 展开时会覆盖整个屏幕的80%宽度</p>
            <p>• 收缩时回到正常的侧边栏状态</p>
            <p>• 支持平滑的动画过渡效果</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">测试步骤</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>查看右侧的 StudioWorkSpace 组件</li>
            <li>点击标题栏右侧的箭头按钮</li>
            <li>观察组件是否正确展开到80%屏幕宽度</li>
            <li>再次点击按钮，观察是否正确收缩</li>
            <li>测试多次展开/收缩的流畅性</li>
          </ol>
        </div>

        {/* 模拟Studio布局 */}
        <div className="flex gap-4 h-[600px]">
          {/* 左侧内容区域 */}
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">主内容区域</h3>
            <p className="text-blue-600 text-sm">
              这里模拟主要的内容区域，比如视频播放器或AI聊天界面。
              当StudioWorkSpace展开时，它会覆盖这个区域的大部分内容。
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-blue-200 rounded"></div>
              <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              <div className="h-4 bg-blue-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* 右侧 StudioWorkSpace */}
          <div className="w-1/4 relative">
            <StudioWorkSpace 
              taskUuid="test-task-uuid"
              apiBaseUrl="http://localhost:8000"
              markdownContent="# 测试内容\n\n这是一个测试的markdown内容。"
              videoRef={videoRef}
            />
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 mb-2">⚠️ 注意事项</h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• 展开时使用 fixed 定位，会覆盖整个屏幕</li>
            <li>• z-index 设置为 30，确保在其他内容之上</li>
            <li>• 展开宽度为 80vw，适合大多数屏幕尺寸</li>
            <li>• 动画时长为 300ms，提供流畅的用户体验</li>
          </ul>
        </div>

        {/* 模拟视频元素 */}
        <video 
          ref={videoRef} 
          style={{ display: 'none' }}
          controls
        >
          <source src="#" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default TestPage_StudioWorkSpace; 
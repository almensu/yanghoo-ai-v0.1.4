import React, { useState } from 'react';
import { useLayoutCoordination } from '../hooks/useLayoutCoordination';
import LayoutConflictWarning from '../components/LayoutConflictWarning';
import StudioWorkSpaceStatus from '../components/StudioWorkSpaceStatus';

const TestPage_LayoutCoordination = () => {
  const { 
    panels, 
    togglePanel, 
    getPanelState, 
    getLayoutStyles, 
    collapseAll 
  } = useLayoutCoordination();
  
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const layoutStyles = getLayoutStyles();

  React.useEffect(() => {
    setShowConflictWarning(layoutStyles.showConflictWarning);
  }, [layoutStyles.showConflictWarning]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">布局协调系统测试</h1>
        
        {/* 布局冲突警告 */}
        <LayoutConflictWarning
          show={showConflictWarning}
          onDismiss={() => setShowConflictWarning(false)}
          onResolve={() => {
            collapseAll();
            setShowConflictWarning(false);
          }}
        />

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">面板控制</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">StudioWorkSpace</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${getPanelState('studioWorkSpace').expanded ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-sm">{getPanelState('studioWorkSpace').expanded ? '已展开' : '已收起'}</span>
              </div>
              <button
                onClick={() => togglePanel('studioWorkSpace')}
                className={`px-3 py-1 text-sm rounded ${
                  getPanelState('studioWorkSpace').expanded 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {getPanelState('studioWorkSpace').expanded ? '收起' : '展开'}
              </button>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">ProjectBasket</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${getPanelState('projectBasket').expanded ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-sm">{getPanelState('projectBasket').expanded ? '已展开' : '已收起'}</span>
              </div>
              <button
                onClick={() => togglePanel('projectBasket')}
                className={`px-3 py-1 text-sm rounded ${
                  getPanelState('projectBasket').expanded 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {getPanelState('projectBasket').expanded ? '收起' : '展开'}
              </button>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">全局操作</h3>
              <button
                onClick={collapseAll}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded mr-2"
              >
                全部收起
              </button>
              <button
                onClick={() => setShowConflictWarning(true)}
                className="px-3 py-1 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 rounded"
              >
                显示冲突警告
              </button>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">状态指示器</h3>
            <StudioWorkSpaceStatus
              projectBasketExpanded={getPanelState('projectBasket').expanded}
              projectBasketVisible={true}
              onProjectBasketToggle={() => togglePanel('projectBasket')}
            />
          </div>
        </div>

        {/* 布局预览 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">布局预览</h2>
          
          {/* 模拟Studio布局 */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-96 overflow-hidden">
            
            {/* 左侧视频区域 */}
            <div className="absolute left-4 top-4 w-1/3 h-32 bg-black rounded flex items-center justify-center text-white text-sm">
              Video Area
            </div>

            {/* 中间AI Chat区域 */}
            <div className={`absolute top-4 bottom-4 bg-blue-50 border border-blue-200 rounded transition-all duration-300 ${
              layoutStyles.mainContentMargin
            }`} style={{ left: 'calc(33.333% + 1rem)', right: 'calc(25% + 1rem)' }}>
              <div className="p-4 h-full flex items-center justify-center text-blue-700">
                <div className="text-center">
                  <div className="text-lg font-medium">AI Chat Area</div>
                  <div className="text-sm mt-1">
                    Right Margin: {layoutStyles.mainContentMargin}
                  </div>
                </div>
              </div>
            </div>

            {/* StudioWorkSpace */}
            <div className={`absolute top-4 bottom-4 right-4 bg-green-50 border border-green-200 rounded transition-all duration-300 ${
              layoutStyles.studioWorkSpaceClass === 'flex-1 min-w-0' ? 'w-1/4' : layoutStyles.studioWorkSpaceClass
            }`}>
              <div className="p-4 h-full flex items-center justify-center text-green-700">
                <div className="text-center">
                  <div className="text-lg font-medium">StudioWorkSpace</div>
                  <div className="text-sm mt-1">
                    {getPanelState('studioWorkSpace').expanded ? 'Expanded (50% width)' : 'Normal (25% width)'}
                  </div>
                </div>
              </div>
            </div>

            {/* ProjectBasket */}
            <div className={`fixed top-4 right-4 h-32 bg-purple-50 border border-purple-200 rounded transition-all duration-300 ${
              getPanelState('projectBasket').expanded ? 'w-96' : 'w-16'
            } ${layoutStyles.projectBasketZIndex}`}>
              <div className="p-2 h-full flex items-center justify-center text-purple-700">
                <div className="text-center">
                  <div className="text-sm font-medium">ProjectBasket</div>
                  <div className="text-xs mt-1">
                    {getPanelState('projectBasket').expanded ? 'Expanded (384px)' : 'Collapsed (64px)'}
                  </div>
                </div>
              </div>
            </div>

            {/* 冲突指示 */}
            {layoutStyles.showConflictWarning && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-amber-100 border border-amber-300 rounded px-3 py-1 text-amber-800 text-sm">
                ⚠️ 布局冲突检测
              </div>
            )}
          </div>

          {/* 布局信息 */}
          <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
            <h4 className="font-medium mb-2">当前布局信息：</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(layoutStyles, null, 2)}
            </pre>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击上方按钮来切换不同面板的展开状态</li>
            <li>• 当StudioWorkSpace和ProjectBasket同时展开时会显示冲突警告</li>
            <li>• 布局系统会自动调整中间区域的边距以避免重叠</li>
            <li>• 在小屏幕上，系统会自动收起所有面板</li>
                         <li>• 优先级：StudioWorkSpace (1) &gt; ProjectBasket (2)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage_LayoutCoordination; 
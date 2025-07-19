import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Video, FileText, Sparkles, Settings, ListVideo, List, Youtube, Camera, Blocks } from 'lucide-react'; // Added Blocks icon

function Sidebar() {
  // Use localStorage to persist sidebar state across page navigation
  const [isExpanded, setIsExpanded] = useState(() => {
    // Get saved state from localStorage or default to false (collapsed)
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : false;
  });

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Define sidebar items
  const menuItems = [
    { name: '视频列表', icon: <Video size={20} />, path: '/' }, // Changed path to root for TaskListPage
    { name: '文档列表', icon: <FileText size={20} />, path: '/docs' },   // Example path (keep or remove based on need)
    // { name: 'Studio专区', icon: <Sparkles size={20} />, path: '/studio' }, // REMOVED - Should navigate from Task list
    { name: 'VideoPlayer 测试', icon: <Settings size={20} />, path: '/test/video-player' }, // Updated Test Page link
    { name: 'VTT Preview 测试', icon: <ListVideo size={20} />, path: '/test/vtt-previewer' }, // New VTT Test Page link
    { name: 'Markdown 测试', icon: <Settings size={20} />, path: '/test/markdown' }, // Added Markdown Test Page link
    { name: 'Markdown List 测试', icon: <List size={20} />, path: '/test/markdownlist' }, // Added MarkdownList Test Page link
    { name: 'YouTube 时间戳 测试', icon: <Youtube size={20} />, path: '/test/youtube-timestamp' }, // Added YouTube timestamp test page
    { name: '关键帧剪辑 测试', icon: <Camera size={20} />, path: '/test/keyframe-clip' }, // Added Keyframe Clip test page
    { name: '块编辑器 测试', icon: <Blocks size={20} />, path: '/test/block-editor' }, // Added Block Editor test page
  ];

  return (
    <div 
      className={`flex flex-col h-screen bg-base-300 text-base-content transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Header / Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-base-content/10">
        {/* Logo / Brand - Only show when expanded */}
        {isExpanded && (
          <span className="text-lg font-bold truncate">YangHoo AI</span>
        )}
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm hover:bg-base-200"
          aria-label={isExpanded ? "收起侧边栏" : "展开侧边栏"}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-content shadow-md'
                      : 'hover:bg-base-200 text-base-content/80 hover:text-base-content'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isExpanded && (
                  <span className="truncate text-sm font-medium">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar; 
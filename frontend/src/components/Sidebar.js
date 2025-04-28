import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Video, FileText, Sparkles, Settings, ListVideo } from 'lucide-react'; // Import icons

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true); // Sidebar starts expanded

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
  ];

  return (
    <div 
      className={`flex flex-col h-screen bg-base-300 text-base-content transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Header / Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-base-content/10">
        {isExpanded && <h2 className="text-xl font-bold whitespace-nowrap overflow-hidden">导航</h2>}
        <button onClick={toggleSidebar} className="btn btn-ghost btn-square">
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) =>
              `flex items-center p-2 space-x-3 rounded-md hover:bg-base-100 ${
                !isExpanded ? 'justify-center' : ''
              } ${isActive ? 'bg-primary text-primary-content' : ''}` // Active link style
            }
            title={item.name} // Tooltip when collapsed
          >
            {item.icon}
            {isExpanded && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Optional Footer */}
      {/* <div className="p-4 border-t border-base-content/10">
        {isExpanded ? <span>Footer Content</span> : null}
      </div> */}
    </div>
  );
}

export default Sidebar; 
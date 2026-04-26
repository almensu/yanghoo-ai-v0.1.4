import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import navigationConfig from '../config/navigation';

function Sidebar({ onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : false;
  });

  // Track collapsed state per collapsible group
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsedGroups');
    const savedGroups = saved !== null ? JSON.parse(saved) : {};
    const defaultGroups = {};

    navigationConfig.forEach(group => {
      if (group.collapsible) {
        defaultGroups[group.id] = group.defaultCollapsed !== false;
      }
    });

    return { ...defaultGroups, ...savedGroups };
  });

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsedGroups', JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div
      className={`flex flex-col h-screen bg-base-300 text-base-content transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Header / Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-base-content/10">
        {isExpanded && (
          <span className="text-lg font-bold truncate">YangHoo AI</span>
        )}
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
        {navigationConfig.map(group => {
          const isCollapsed = collapsedGroups[group.id] !== false;
          const visibleItems = group.items.filter(item => !item.hidden);

          return (
            <div key={group.id} className="mb-2">
              {/* Group header for collapsible groups */}
              {group.collapsible && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 hover:text-base-content/80 transition-colors"
                >
                  {group.icon && <group.icon size={14} />}
                  {isExpanded && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                      />
                    </>
                  )}
                </button>
              )}

              {/* Group label for non-collapsible groups (only when expanded) */}
              {!group.collapsible && isExpanded && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
                  {group.label}
                </div>
              )}

              {/* Items */}
              {(!group.collapsible || !isCollapsed) && (
                <ul className="space-y-1 px-2">
                  {visibleItems.map(item => {
                    const IconComponent = item.icon;
                    return (
                      <li key={item.id}>
                        <NavLink
                          to={item.path}
                          onClick={() => onNavigate && onNavigate()}
                          className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-primary text-primary-content shadow-md'
                                : 'hover:bg-base-200 text-base-content/80 hover:text-base-content'
                            }`
                          }
                          title={isExpanded ? '' : item.label}
                        >
                          {IconComponent && (
                            <span className="flex-shrink-0">
                              <IconComponent size={20} />
                            </span>
                          )}
                          {isExpanded && (
                            <span className="truncate text-sm font-medium">{item.label}</span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;

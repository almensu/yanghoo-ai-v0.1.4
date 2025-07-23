import React from 'react';
import { Package, ChevronRight } from 'lucide-react';

const StudioWorkSpaceStatus = ({ 
  projectBasketExpanded = false, 
  projectBasketVisible = true,
  onProjectBasketToggle,
  className = '' 
}) => {
  if (!projectBasketVisible) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <div className="flex items-center gap-1">
        <Package size={12} className="text-blue-500" />
        <span>项目篮</span>
        <span className={`w-2 h-2 rounded-full ${projectBasketExpanded ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </div>
      
      {onProjectBasketToggle && (
        <button
          onClick={onProjectBasketToggle}
          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-xs"
          title={projectBasketExpanded ? "收起项目篮" : "展开项目篮"}
        >
          <ChevronRight 
            size={12} 
            className={`transform transition-transform ${projectBasketExpanded ? 'rotate-180' : ''}`} 
          />
          {projectBasketExpanded ? '收起' : '展开'}
        </button>
      )}
    </div>
  );
};

export default StudioWorkSpaceStatus; 
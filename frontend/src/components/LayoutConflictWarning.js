import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const LayoutConflictWarning = ({ 
  show = false, 
  onDismiss,
  onResolve,
  className = '' 
}) => {
  if (!show) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-60 ${className}`}>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800 mb-1">
              布局冲突检测
            </h4>
            <p className="text-xs text-amber-700 mb-2">
              StudioWorkSpace和项目篮同时展开可能影响使用体验
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={onResolve}
                className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded"
              >
                自动调整
              </button>
              <button
                onClick={onDismiss}
                className="text-xs px-2 py-1 text-amber-600 hover:text-amber-800"
              >
                忽略
              </button>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutConflictWarning; 
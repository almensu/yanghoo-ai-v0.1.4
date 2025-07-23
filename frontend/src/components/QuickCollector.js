import React, { useState, useRef, useEffect } from 'react';
import { projectManager } from '../utils/ProjectManager';
import { Plus, Check, Package, ArrowRight } from 'lucide-react';

const QuickCollector = ({ 
  block, 
  taskUuid, 
  taskTitle, 
  filename,
  onCollected,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  
  const buttonRef = useRef(null);
  const selectorRef = useRef(null);

  useEffect(() => {
    // 加载项目数据
    const allProjects = projectManager.getAllProjects();
    setProjects(allProjects);
    
    const active = projectManager.getActiveProject();
    setActiveProject(active);
  }, []);

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowProjectSelector(false);
      }
    };

    if (showProjectSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectSelector]);

  // 快速添加到当前活跃项目
  const handleQuickAdd = async () => {
    if (!activeProject) {
      setShowProjectSelector(true);
      return;
    }

    await addToProject(activeProject.id);
  };

  // 添加到指定项目
  const addToProject = async (projectId) => {
    setIsCollecting(true);

    try {
      const blockData = {
        taskUuid,
        taskTitle,
        filename,
        blockId: block.id,
        content: block.content,
        timestamp: block.timestamp || null
      };

      const result = projectManager.addBlock(projectId, blockData);
      
      if (result) {
        // 成功添加
        setShowSuccess(true);
        if (onCollected) {
          onCollected(projectId, result);
        }

        // 2秒后隐藏成功状态
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        // 可能是重复添加
        console.warn('Block already exists in project or failed to add');
      }
    } catch (error) {
      console.error('Failed to add block to project:', error);
    } finally {
      setIsCollecting(false);
      setShowProjectSelector(false);
    }
  };

  // 创建新项目并添加
  const handleCreateProjectAndAdd = () => {
    const projectName = prompt('请输入新项目名称:');
    if (!projectName?.trim()) return;

    const newProject = projectManager.createProject(projectName.trim());
    if (newProject) {
      setActiveProject(newProject);
      setProjects(projectManager.getAllProjects());
      addToProject(newProject.id);
    }
  };

  if (showSuccess) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs ${className}`}>
        <Check size={12} />
        已收集
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleQuickAdd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isCollecting}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-all
          ${isCollecting 
            ? 'bg-blue-100 text-blue-600 cursor-wait' 
            : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 cursor-pointer'
          }
          ${className}
        `}
        title={activeProject ? `添加到项目: ${activeProject.name}` : '选择项目收集'}
      >
        {isCollecting ? (
          <>
            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
            收集中...
          </>
        ) : (
          <>
            <Plus size={12} />
            {activeProject ? '收集' : '选择项目'}
          </>
        )}
      </button>

      {/* 项目选择器 */}
      {showProjectSelector && (
        <div
          ref={selectorRef}
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48"
        >
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="text-xs font-medium text-gray-700">选择项目</div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {projects.length > 0 ? (
              projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => addToProject(project.id)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <Package size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有项目</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={handleCreateProjectAndAdd}
              className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
            >
              <Plus size={14} />
              创建新项目
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 快速收集悬浮按钮组件
export const FloatingCollector = ({ 
  block, 
  taskUuid, 
  taskTitle, 
  filename,
  onCollected,
  isVisible = false,
  position = { x: 0, y: 0 }
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="pointer-events-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2">
        <QuickCollector
          block={block}
          taskUuid={taskUuid}
          taskTitle={taskTitle}
          filename={filename}
          onCollected={onCollected}
        />
      </div>
    </div>
  );
};

export default QuickCollector; 
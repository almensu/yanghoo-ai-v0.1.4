import React, { useState, useEffect, useRef } from 'react';
import { projectManager } from '../utils/ProjectManager';
import { formatTokenCount } from '../utils/tokenUtils';
import { 
  Package, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Download,
  MessageCircle,
  GripVertical,
  FileText,
  Hash
} from 'lucide-react';

const ProjectBasket = ({ 
  isVisible = true, 
  isExpanded = false,
  onToggle,
  onSendToAI,
  className = '' 
}) => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [stats, setStats] = useState(null);

  // 加载项目数据
  useEffect(() => {
    loadProjects();
    loadActiveProject();
  }, []);

  const loadProjects = () => {
    try {
      const allProjects = projectManager.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // 显示错误提示
      showErrorMessage('加载项目列表失败');
    }
  };

  const loadActiveProject = () => {
    try {
      const active = projectManager.getActiveProject();
      setActiveProject(active);
      if (active) {
        const projectStats = projectManager.getProjectStats(active.id);
        setStats(projectStats);
      }
    } catch (error) {
      console.error('Failed to load active project:', error);
      showErrorMessage('加载当前项目失败');
    }
  };

  // 错误提示函数
  const showErrorMessage = (message) => {
    // 可以在这里添加toast通知或其他错误提示机制
    console.error(message);
  };

  // 创建新项目
  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject = projectManager.createProject(
      newProjectName.trim(), 
      newProjectDescription.trim()
    );

    setNewProjectName('');
    setNewProjectDescription('');
    setShowNewProjectModal(false);
    
    loadProjects();
    loadActiveProject();
  };

  // 切换活跃项目
  const handleSwitchProject = (projectId) => {
    projectManager.setActiveProject(projectId);
    loadActiveProject();
  };

  // 删除项目
  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个项目吗？')) {
      projectManager.deleteProject(projectId);
      loadProjects();
      loadActiveProject();
    }
  };

  // 移除项目项
  const handleRemoveItem = (itemId, type) => {
    if (!activeProject) return;

    if (type === 'block') {
      projectManager.removeBlock(activeProject.id, itemId);
    } else if (type === 'document') {
      projectManager.removeDocument(activeProject.id, itemId);
    }

    loadActiveProject();
  };

  // 拖拽处理
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    
    if (!draggedItem || !activeProject) return;

    // 这里可以实现重新排序逻辑
    // 暂时先简单处理
    console.log('拖拽重排序功能待实现');
    
    setDraggedItem(null);
  };

  // 发送到AI Chat
  const handleSendToAI = () => {
    if (!activeProject || !onSendToAI) return;
    
    onSendToAI(activeProject);
  };

  // 导出项目
  const handleExport = (format) => {
    if (!activeProject) return;

    const exported = projectManager.exportProject(activeProject.id, format);
    if (exported) {
      // 创建下载链接
      const blob = new Blob([exported.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exported.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg z-50 transition-all duration-300 ${
      isExpanded ? 'w-96' : 'w-16'
    } ${className}`}>
      
      {/* 收起/展开按钮 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        {isExpanded ? (
          <>
            <div className="flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              <span className="font-medium text-gray-900">项目篮</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded"
          >
            <div className="relative">
              <Package size={20} className="text-blue-600" />
              {activeProject && (stats?.totalBlocks > 0 || stats?.totalDocuments > 0) && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(stats?.totalBlocks || 0) + (stats?.totalDocuments || 0)}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-col h-full">
          
          {/* 项目选择器 */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">当前项目</span>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="新建项目"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <select
              value={activeProject?.id || ''}
              onChange={(e) => handleSwitchProject(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">选择项目...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {activeProject && (
              <div className="mt-2 text-xs text-gray-500">
                {stats?.totalBlocks || 0}个块 + {stats?.totalDocuments || 0}个文档
                <br />
                约 {formatTokenCount(stats?.totalTokens || 0)} tokens
              </div>
            )}
          </div>

          {/* 项目内容 */}
          <div className="flex-1 overflow-y-auto">
            {activeProject ? (
              <div className="p-3">
                
                {/* 收集的块 */}
                {activeProject.selectedBlocks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Hash size={14} />
                      收集的块 ({activeProject.selectedBlocks.length})
                    </h4>
                    
                    <div className="space-y-2">
                      {activeProject.selectedBlocks
                        .sort((a, b) => a.order - b.order)
                        .map((block) => (
                          <div
                            key={block.id}
                            className="group p-2 bg-gray-50 rounded border hover:border-blue-300 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, block, 'block')}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, block, 'block')}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical size={12} className="text-gray-400 mt-1 opacity-0 group-hover:opacity-100" />
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-600 mb-1">
                                  {block.taskTitle || 'Unknown Task'} / {block.filename}
                                </div>
                                <div className="text-sm text-gray-900 line-clamp-2">
                                  {projectManager.extractTitle(block.content)}
                                </div>
                                {block.timestamp && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    [{projectManager.formatTime(block.timestamp.start)}-{projectManager.formatTime(block.timestamp.end)}]
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleRemoveItem(block.id, 'block')}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                                title="移除"
                              >
                                <X size={12} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 收集的文档 */}
                {activeProject.selectedDocuments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FileText size={14} />
                      完整文档 ({activeProject.selectedDocuments.length})
                    </h4>
                    
                    <div className="space-y-2">
                      {activeProject.selectedDocuments
                        .sort((a, b) => a.order - b.order)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="group p-2 bg-green-50 rounded border hover:border-green-300 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, doc, 'document')}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, doc, 'document')}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical size={12} className="text-gray-400 mt-1 opacity-0 group-hover:opacity-100" />
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-600 mb-1">
                                  {doc.taskTitle || 'Unknown Task'}
                                </div>
                                <div className="text-sm text-gray-900 font-medium">
                                  {doc.filename}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveItem(doc.id, 'document')}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                                title="移除"
                              >
                                <X size={12} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 空状态 */}
                {activeProject.selectedBlocks.length === 0 && activeProject.selectedDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">项目篮是空的</p>
                    <p className="text-xs mt-1">开始收集有用的内容块吧</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500">
                <p className="text-sm">请先选择或创建一个项目</p>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          {activeProject && (stats?.totalBlocks > 0 || stats?.totalDocuments > 0) && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="space-y-2">
                <button
                  onClick={handleSendToAI}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle size={16} />
                  发送到AI Chat
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('newsletter')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    <Download size={12} />
                    Newsletter
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    <Download size={12} />
                    Markdown
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 新建项目模态框 */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium mb-4">新建项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入项目名称..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目描述
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="简单描述这个项目的目的..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBasket; 
import React, { useState, useEffect } from 'react';
import { projectManager } from '../utils/ProjectManager';
import { formatTokenCount } from '../utils/tokenUtils';
import './ProjectBubble.css';
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
  Hash,
  Minimize2,
  Maximize2
} from 'lucide-react';

const ProjectBubble = ({ 
  onSendToAI,
  taskUuid,
  apiBaseUrl,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [stats, setStats] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
    }
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
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // 只有当拖拽真正离开气泡区域时才取消高亮
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // 处理内部拖拽重排序
    if (draggedItem && activeProject) {
      console.log('拖拽重排序功能待实现');
      setDraggedItem(null);
      return;
    }

    // 处理外部拖拽
    try {
      const dragDataText = e.dataTransfer.getData('text/plain');
      if (!dragDataText) return;

      // 尝试解析为JSON（来自BlockEditor的块数据）
      let dragData;
      try {
        dragData = JSON.parse(dragDataText);
      } catch (parseError) {
        // 如果不是JSON，可能是markdown文件名
        if (dragDataText.endsWith('.md')) {
          handleMarkdownFileDrop(dragDataText);
          return;
        }
        console.warn('无法解析拖拽数据:', dragDataText);
        return;
      }
      
      if (dragData.type === 'block' && dragData.source === 'block-editor') {
        // 确保有活跃项目
        if (!activeProject) {
          // 如果没有活跃项目，创建一个默认项目
          const newProject = projectManager.createProject(
            `项目 ${new Date().toLocaleDateString()}`,
            '从块编辑器拖拽创建'
          );
          projectManager.setActiveProject(newProject.id);
          loadActiveProject();
        }

        // 添加块到活跃项目
        const currentActive = projectManager.getActiveProject();
        if (currentActive) {
          projectManager.addBlock(currentActive.id, {
            blockId: dragData.block.id, // 原始块ID
            content: dragData.block.content,
            type: dragData.block.type,
            taskUuid: dragData.block.taskUuid,
            taskTitle: dragData.block.taskTitle || `Task ${dragData.block.taskUuid}`,
            filename: dragData.block.filename || 'Unknown File',
            blockIndex: dragData.block.blockIndex || 1,
            totalBlocks: dragData.block.totalBlocks || 1,
            docId: dragData.block.docId || null, // doc_files中的文档ID
            category: dragData.block.category || 'user_documents', // 文档类别
            source: 'block-editor',
            addedAt: new Date().toISOString()
          });
          
          loadActiveProject();
          
          // 显示成功提示
          console.log('块已添加到项目篮');
          showSuccessMessage(`块已添加到项目篮`);
        }
      }
    } catch (error) {
      console.error('处理拖拽数据时出错:', error);
    }
  };

  // 显示成功提示
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // 处理markdown文件拖拽
  const handleMarkdownFileDrop = (filename) => {
    // 确保有活跃项目
    if (!activeProject) {
      const newProject = projectManager.createProject(
        `项目 ${new Date().toLocaleDateString()}`,
        '从文档拖拽创建'
      );
      projectManager.setActiveProject(newProject.id);
      loadActiveProject();
    }

    // 添加文档到活跃项目
    const currentActive = projectManager.getActiveProject();
    if (currentActive) {
      // 检查文档是否已经存在
      const existingDoc = currentActive.selectedDocuments?.find(doc => doc.filename === filename);
      if (existingDoc) {
        console.log('文档已存在于项目中:', filename);
        return;
      }

      projectManager.addDocument(currentActive.id, {
        taskUuid: taskUuid || 'unknown',
        taskTitle: `Task ${taskUuid || 'unknown'}`,
        filename: filename,
        content: '', // 将在需要时异步加载
        collectTime: new Date().toISOString(),
        order: (currentActive.selectedDocuments?.length || 0) + 1
      });
      
      loadActiveProject();
      
      // 显示成功提示
      console.log('文档已添加到项目篮:', filename);
      showSuccessMessage(`文档 "${filename}" 已添加到项目篮`);
    }
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

  // 气泡样式
  const itemCount = (stats?.totalBlocks || 0) + (stats?.totalDocuments || 0);

  return (
    <>
      {/* 气泡主体 */}
      <div 
        className={`project-bubble bg-white border ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        } ${isExpanded ? 'project-bubble-expanded' : 'project-bubble-collapsed'} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        
        {/* 收起状态 - 圆形气泡 */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className={`w-full h-full flex items-center justify-center rounded-2xl transition-colors group ${
              isDragOver ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              <Package 
                size={24} 
                className={`${
                  isDragOver ? 'text-blue-700' : 'text-blue-600 group-hover:text-blue-700'
                }`} 
              />
              {activeProject && itemCount > 0 && (
                <span className="project-bubble-badge">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              {isDragOver && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  拖拽到此添加块或文档
                </div>
              )}
            </div>
          </button>
        )}

        {/* 展开状态 - 完整面板 */}
        {isExpanded && (
          <div className="flex flex-col h-full">
            
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                <span className="font-medium text-gray-900">项目篮</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="收起"
              >
                <Minimize2 size={16} />
              </button>
            </div>

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
            <div className="flex-1 overflow-y-auto project-bubble-content">
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
                          .slice(0, 3) // 只显示前3个
                          .map((block) => (
                            <div
                              key={block.id}
                              className="group p-2 bg-gray-50 rounded border hover:border-blue-300 project-bubble-item"
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {block.taskTitle} • {block.filename}
                                  </div>
                                  <div className="text-xs text-gray-900 line-clamp-2">
                                    {block.content}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem(block.id, 'block')}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        
                        {activeProject.selectedBlocks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            还有 {activeProject.selectedBlocks.length - 3} 个块...
                          </div>
                        )}
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
                          .slice(0, 2) // 只显示前2个
                          .map((doc) => (
                                                         <div
                               key={doc.id}
                               className="group p-2 bg-gray-50 rounded border hover:border-blue-300 project-bubble-item"
                             >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {doc.taskTitle} • {doc.filename}
                                  </div>
                                  <div className="text-xs text-gray-900">
                                    {doc.content.length > 100 
                                      ? `${doc.content.substring(0, 100)}...`
                                      : doc.content
                                    }
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem(doc.id, 'document')}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        
                        {activeProject.selectedDocuments.length > 2 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            还有 {activeProject.selectedDocuments.length - 2} 个文档...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 空状态 */}
                  {(!activeProject.selectedBlocks.length && !activeProject.selectedDocuments.length) && (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={24} className="mx-auto mb-2 text-gray-400" />
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
              <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="space-y-2">
                  <button
                    onClick={handleSendToAI}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
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
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed bottom-24 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* 新建项目模态框 */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 project-bubble-modal z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">新建项目</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目名称
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入项目名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  项目描述（可选）
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="输入项目描述"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectBubble; 
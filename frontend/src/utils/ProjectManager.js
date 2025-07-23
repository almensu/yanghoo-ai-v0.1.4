// 生成短ID的工具函数
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// 项目数据结构
export const PROJECT_SCHEMA = {
  id: '', // 项目唯一ID
  name: '', // 项目名称
  description: '', // 项目描述
  selectedBlocks: [], // 选中的块
  selectedDocuments: [], // 选中的完整文档
  createdAt: '', // 创建时间
  updatedAt: '', // 更新时间
  version: '1.0' // 版本号
};

// localStorage keys
const STORAGE_KEYS = {
  PROJECTS: 'yanghoo_projects',
  ACTIVE_PROJECT: 'yanghoo_active_project'
};

// 块数据结构
export const BLOCK_ITEM_SCHEMA = {
  id: '', // 块的唯一标识
  taskUuid: '', // 所属任务UUID
  taskTitle: '', // 任务标题
  filename: '', // 文件名
  blockId: '', // 原始块ID
  content: '', // 块内容
  timestamp: null, // 视频时间戳 {start, end}
  collectTime: '', // 收集时间
  order: 0 // 在项目中的排序
};

// 文档数据结构
export const DOCUMENT_ITEM_SCHEMA = {
  id: '', // 文档项的唯一标识
  taskUuid: '', // 所属任务UUID
  taskTitle: '', // 任务标题
  filename: '', // 文件名
  content: '', // 完整内容
  collectTime: '', // 收集时间
  order: 0 // 在项目中的排序
};

export class ProjectManager {
  constructor() {
    this.projects = this.loadProjects();
    this.activeProjectId = this.getActiveProjectId();
  }

  // ===== 项目基础操作 =====
  
  /**
   * 创建新项目
   */
  createProject(name, description = '') {
    const project = {
      ...PROJECT_SCHEMA,
      id: `proj_${generateShortId()}`,
      name,
      description,
      selectedBlocks: [],
      selectedDocuments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects[project.id] = project;
    this.saveProjects();
    this.setActiveProject(project.id);
    
    return project;
  }

  /**
   * 获取项目
   */
  getProject(projectId) {
    return this.projects[projectId] || null;
  }

  /**
   * 获取所有项目
   */
  getAllProjects() {
    return Object.values(this.projects);
  }

  /**
   * 获取当前活跃项目
   */
  getActiveProject() {
    return this.activeProjectId ? this.getProject(this.activeProjectId) : null;
  }

  /**
   * 设置活跃项目
   */
  setActiveProject(projectId) {
    if (this.projects[projectId]) {
      this.activeProjectId = projectId;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, projectId);
      return true;
    }
    return false;
  }

  /**
   * 更新项目基本信息
   */
  updateProject(projectId, updates) {
    const project = this.projects[projectId];
    if (!project) return false;

    Object.assign(project, updates, {
      updatedAt: new Date().toISOString()
    });

    this.saveProjects();
    return true;
  }

  /**
   * 删除项目
   */
  deleteProject(projectId) {
    if (!this.projects[projectId]) return false;

    delete this.projects[projectId];
    
    // 如果删除的是活跃项目，清除活跃状态
    if (this.activeProjectId === projectId) {
      this.activeProjectId = null;
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT);
    }

    this.saveProjects();
    return true;
  }

  // ===== 块操作 =====

  /**
   * 添加块到项目
   */
  addBlock(projectId, blockData) {
    const project = this.projects[projectId];
    if (!project) return false;

    const blockItem = {
      ...BLOCK_ITEM_SCHEMA,
      id: `block_${generateShortId()}`,
      ...blockData,
      collectTime: new Date().toISOString(),
      order: project.selectedBlocks.length
    };

    // 检查是否已存在相同的块
    const exists = project.selectedBlocks.some(block => 
      block.taskUuid === blockItem.taskUuid && 
      block.filename === blockItem.filename && 
      block.blockId === blockItem.blockId
    );

    if (exists) return false; // 避免重复添加

    project.selectedBlocks.push(blockItem);
    project.updatedAt = new Date().toISOString();
    
    this.saveProjects();
    return blockItem;
  }

  /**
   * 移除项目中的块
   */
  removeBlock(projectId, blockItemId) {
    const project = this.projects[projectId];
    if (!project) return false;

    const index = project.selectedBlocks.findIndex(block => block.id === blockItemId);
    if (index === -1) return false;

    project.selectedBlocks.splice(index, 1);
    project.updatedAt = new Date().toISOString();
    
    this.saveProjects();
    return true;
  }

  /**
   * 重新排序项目中的块
   */
  reorderBlocks(projectId, blockItemIds) {
    const project = this.projects[projectId];
    if (!project) return false;

    // 重新排序
    const reorderedBlocks = [];
    blockItemIds.forEach((id, index) => {
      const block = project.selectedBlocks.find(b => b.id === id);
      if (block) {
        block.order = index;
        reorderedBlocks.push(block);
      }
    });

    project.selectedBlocks = reorderedBlocks;
    project.updatedAt = new Date().toISOString();
    
    this.saveProjects();
    return true;
  }

  // ===== 文档操作 =====

  /**
   * 添加完整文档到项目
   */
  addDocument(projectId, documentData) {
    const project = this.projects[projectId];
    if (!project) return false;

    const documentItem = {
      ...DOCUMENT_ITEM_SCHEMA,
      id: `doc_${generateShortId()}`,
      ...documentData,
      collectTime: new Date().toISOString(),
      order: project.selectedDocuments.length
    };

    // 检查是否已存在相同的文档
    const exists = project.selectedDocuments.some(doc => 
      doc.taskUuid === documentItem.taskUuid && 
      doc.filename === documentItem.filename
    );

    if (exists) return false; // 避免重复添加

    project.selectedDocuments.push(documentItem);
    project.updatedAt = new Date().toISOString();
    
    this.saveProjects();
    return documentItem;
  }

  /**
   * 移除项目中的文档
   */
  removeDocument(projectId, documentItemId) {
    const project = this.projects[projectId];
    if (!project) return false;

    const index = project.selectedDocuments.findIndex(doc => doc.id === documentItemId);
    if (index === -1) return false;

    project.selectedDocuments.splice(index, 1);
    project.updatedAt = new Date().toISOString();
    
    this.saveProjects();
    return true;
  }

  // ===== 统计和分析 =====

  /**
   * 获取项目统计信息
   */
  getProjectStats(projectId) {
    const project = this.projects[projectId];
    if (!project) return null;

    const totalBlocks = project.selectedBlocks.length;
    const totalDocuments = project.selectedDocuments.length;
    
    // 估算token数量
    const blocksTokens = project.selectedBlocks.reduce((sum, block) => {
      return sum + this.estimateTokenCount(block.content);
    }, 0);

    const documentsTokens = project.selectedDocuments.reduce((sum, doc) => {
      return sum + this.estimateTokenCount(doc.content);
    }, 0);

    const totalTokens = blocksTokens + documentsTokens;

    // 统计来源任务
    const sourceTasks = new Set();
    project.selectedBlocks.forEach(block => sourceTasks.add(block.taskUuid));
    project.selectedDocuments.forEach(doc => sourceTasks.add(doc.taskUuid));

    return {
      totalBlocks,
      totalDocuments,
      totalTokens,
      blocksTokens,
      documentsTokens,
      sourceTasks: sourceTasks.size,
      lastUpdated: project.updatedAt
    };
  }

  /**
   * 简单的token估算
   */
  estimateTokenCount(text) {
    if (!text) return 0;
    // 简单估算：中文字符*1.5 + 英文单词数
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return Math.ceil(chineseChars * 1.5 + englishWords);
  }

  // ===== localStorage操作 =====

  /**
   * 加载项目数据
   */
  loadProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
      return {};
    }
  }

  /**
   * 保存项目数据
   */
  saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  }

  /**
   * 获取活跃项目ID
   */
  getActiveProjectId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
  }

  // ===== 导出功能 =====

  /**
   * 导出项目为不同格式
   */
  exportProject(projectId, format = 'markdown') {
    const project = this.projects[projectId];
    if (!project) return null;

    switch (format) {
      case 'newsletter':
        return this.exportAsNewsletter(project);
      case 'markdown':
        return this.exportAsMarkdown(project);
      case 'json':
        return this.exportAsJSON(project);
      default:
        return null;
    }
  }

  /**
   * 导出为Newsletter格式
   */
  exportAsNewsletter(project) {
    const stats = this.getProjectStats(project.id);
    let content = `# ${project.name}\n\n`;
    
    if (project.description) {
      content += `> ${project.description}\n\n`;
    }

    content += `> 📊 本期内容：${stats.totalBlocks}个核心要点 + ${stats.totalDocuments}个参考文档\n`;
    content += `> 🗓️ 整理时间：${new Date(project.updatedAt).toLocaleDateString()}\n\n`;

    // 核心要点部分
    if (project.selectedBlocks.length > 0) {
      content += `## 💡 核心要点\n\n`;
      
      project.selectedBlocks
        .sort((a, b) => a.order - b.order)
        .forEach((block, index) => {
          content += `### ${index + 1}. ${this.extractTitle(block.content)}\n\n`;
          content += `${block.content}\n\n`;
          
          // 添加来源信息
          content += `> **来源**：${block.taskTitle || 'Unknown Task'}`;
          if (block.timestamp) {
            const start = this.formatTime(block.timestamp.start);
            const end = this.formatTime(block.timestamp.end);
            content += ` [${start}-${end}]`;
          }
          content += `  \n> **文件**：\`${block.filename}\`\n\n`;
        });
    }

    // 参考文档部分
    if (project.selectedDocuments.length > 0) {
      content += `## 📚 参考文档\n\n`;
      project.selectedDocuments
        .sort((a, b) => a.order - b.order)
        .forEach((doc, index) => {
          content += `${index + 1}. **${doc.filename}**`;
          content += ` - 来自 ${doc.taskTitle || 'Unknown Task'}\n`;
        });
      content += '\n';
    }

    // 引用清单
    content += `## 📝 引用清单\n\n`;
    let citationIndex = 1;

    project.selectedBlocks.forEach(block => {
      content += `${citationIndex}. ${block.taskTitle || 'Unknown Task'} - \`${block.filename}\``;
      if (block.timestamp) {
        const start = this.formatTime(block.timestamp.start);
        const end = this.formatTime(block.timestamp.end);
        content += ` [${start}-${end}]`;
      }
      content += '\n';
      citationIndex++;
    });

    project.selectedDocuments.forEach(doc => {
      content += `${citationIndex}. ${doc.taskTitle || 'Unknown Task'} - \`${doc.filename}\` (完整文档)\n`;
      citationIndex++;
    });

    content += '\n---\n';
    content += `*本期内容基于我的项目研究，所有引用已标注出处*\n`;

    return {
      content,
      filename: `${project.name}_Newsletter_${new Date().toISOString().split('T')[0]}.md`,
      stats
    };
  }

  /**
   * 导出为Markdown格式
   */
  exportAsMarkdown(project) {
    let content = `# ${project.name}\n\n`;
    
    if (project.description) {
      content += `${project.description}\n\n`;
    }

    content += `> 创建时间：${new Date(project.createdAt).toLocaleString()}  \n`;
    content += `> 最后更新：${new Date(project.updatedAt).toLocaleString()}  \n\n`;

    // 收集的块
    if (project.selectedBlocks.length > 0) {
      content += `## 收集内容\n\n`;
      
      project.selectedBlocks
        .sort((a, b) => a.order - b.order)
        .forEach((block, index) => {
          content += `### ${index + 1}. ${this.extractTitle(block.content)}\n\n`;
          content += `${block.content}\n\n`;
          content += `> **来源**：${block.taskTitle} - \`${block.filename}\` Block-${block.blockId}  \n`;
          content += `> **任务ID**：${block.taskUuid}\n\n`;
        });
    }

    // 完整文档
    if (project.selectedDocuments.length > 0) {
      content += `## 完整文档\n\n`;
      project.selectedDocuments
        .sort((a, b) => a.order - b.order)
        .forEach((doc, index) => {
          content += `${index + 1}. [${doc.filename}] - 来自任务${doc.taskUuid}\n`;
        });
      content += '\n';
    }

    return {
      content,
      filename: `${project.name}_Export_${new Date().toISOString().split('T')[0]}.md`,
      stats: this.getProjectStats(project.id)
    };
  }

  /**
   * 导出为JSON格式
   */
  exportAsJSON(project) {
    return {
      content: JSON.stringify(project, null, 2),
      filename: `${project.name}_Export_${new Date().toISOString().split('T')[0]}.json`,
      stats: this.getProjectStats(project.id)
    };
  }

  // ===== 工具函数 =====

  /**
   * 从内容中提取标题
   */
  extractTitle(content) {
    if (!content) return '无标题';
    
    // 尝试提取markdown标题
    const titleMatch = content.match(/^#+\s*(.+)/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // 取第一行作为标题
    const firstLine = content.split('\n')[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }

  /**
   * 格式化时间戳
   */
  formatTime(seconds) {
    if (!seconds) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// 单例实例
export const projectManager = new ProjectManager(); 
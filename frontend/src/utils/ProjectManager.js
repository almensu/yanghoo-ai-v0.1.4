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
  id: '', // 项目中块的唯一标识
  taskUuid: '', // 所属任务UUID
  taskTitle: '', // 任务标题
  filename: '', // 文件名
  blockId: '', // 原始块ID（在文档中的ID）
  blockIndex: 1, // 块在文档中的序号（1-based）
  totalBlocks: 1, // 文档总块数
  docId: '', // doc_files中的文档ID
  category: '', // 文档类别（transcripts, analysis, user_documents, system_generated）
  content: '', // 块内容
  type: '', // 块类型（paragraph, heading, code等）
  timestamp: null, // 视频时间戳 {start, end}
  source: '', // 来源（block-editor, manual等）
  collectTime: '', // 收集时间
  addedAt: '', // 添加到项目的时间
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

  /**
   * 获取文档类别的友好描述
   */
  getCategoryDescription(category) {
    const categoryMap = {
      'transcripts': '转录文档',
      'analysis': '分析文档', 
      'user_documents': '用户文档',
      'system_generated': '系统生成文档'
    };
    return categoryMap[category] || null;
  }

  // ===== localStorage操作 =====

  /**
   * 添加以下方法
   *
   * 从后端API加载项目数据
   */
  async loadProjectsFromAPI() {
    try {
      const response = await fetch('http://localhost:8000/api/projects');
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      const projectsArray = await response.json();
      
      // 转换为对象格式
      const projectsObj = {};
      projectsArray.forEach(project => {
        projectsObj[project.id] = project;
      });
      
      return projectsObj;
    } catch (error) {
      console.error('从API加载项目失败:', error);
      // 回退到本地存储
      return this.loadProjects();
    }
  }
  
  /**
   * 保存项目数据到后端API
   */
  async saveProjectsToAPI() {
    try {
      // 获取所有项目
      const projects = Object.values(this.projects);
      
      // 对每个项目进行更新或创建
      for (const project of projects) {
        const method = project.id.startsWith('project_') ? 'PUT' : 'POST';
        const url = method === 'PUT' 
          ? `http://localhost:8000/api/projects/${project.id}` 
          : 'http://localhost:8000/api/projects';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        });
        
        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('保存项目到API失败:', error);
      // 回退到本地存储
      this.saveProjects();
      return false;
    }
  }
  
  /**
   * 混合加载项目（先尝试API，失败则使用本地存储）
   */
  async loadProjectsHybrid() {
    // 先尝试从API加载
    const apiProjects = await this.loadProjectsFromAPI();
    
    if (Object.keys(apiProjects).length > 0) {
      this.projects = apiProjects;
      return this.projects;
    }
    
    // 如果API加载失败或没有数据，从本地加载
    this.projects = this.loadProjects();
    
    // 如果本地有数据但API没有，尝试同步到API
    if (Object.keys(this.projects).length > 0) {
      this.saveProjectsToAPI();
    }
    
    return this.projects;
  }
  
  /**
   * 混合保存项目（同时保存到API和本地存储）
   */
  async saveProjectsHybrid() {
    // 先保存到本地
    this.saveProjects();
    
    // 再保存到API
    return await this.saveProjectsToAPI();
  }
  
  /**
   * 添加块到项目（API版本）
   */
  async addBlockAPI(projectId, blockData) {
    try {
      // 1. 创建块
      const blockResponse = await fetch('http://localhost:8000/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      });
      
      if (!blockResponse.ok) {
        throw new Error(`创建块API错误: ${blockResponse.status}`);
      }
      
      const block = await blockResponse.json();
      
      // 2. 将块添加到项目
      const linkResponse = await fetch(`http://localhost:8000/api/projects/${projectId}/blocks/${block.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!linkResponse.ok) {
        throw new Error(`关联块到项目API错误: ${linkResponse.status}`);
      }
      
      // 3. 更新本地缓存
      if (!this.projects[projectId]) {
        // 如果本地没有此项目，重新加载所有项目
        await this.loadProjectsHybrid();
      } else {
        // 否则只更新这个项目的块列表
        if (!this.projects[projectId].selectedBlocks) {
          this.projects[projectId].selectedBlocks = [];
        }
        this.projects[projectId].selectedBlocks.push(block.id);
        this.saveProjects(); // 更新本地存储
      }
      
      return block;
    } catch (error) {
      console.error('通过API添加块失败:', error);
      // 回退到本地方法
      return this.addBlock(projectId, blockData);
    }
  }
  
  /**
   * 从项目中移除块（API版本）
   */
  async removeBlockAPI(projectId, blockId) {
    try {
      // 从项目中移除块
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/blocks/${blockId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      // 更新本地缓存
      if (this.projects[projectId] && this.projects[projectId].selectedBlocks) {
        const index = this.projects[projectId].selectedBlocks.indexOf(blockId);
        if (index !== -1) {
          this.projects[projectId].selectedBlocks.splice(index, 1);
          this.saveProjects(); // 更新本地存储
        }
      }
      
      return true;
    } catch (error) {
      console.error('通过API移除块失败:', error);
      // 回退到本地方法
      return this.removeBlock(projectId, blockId);
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
          
          // 添加完整的溯源信息
          content += `> **来源任务**：${block.taskTitle || 'Unknown Task'}`;
          if (block.timestamp) {
            const start = this.formatTime(block.timestamp.start);
            const end = this.formatTime(block.timestamp.end);
            content += ` [${start}-${end}]`;
          }
          content += `  \n> **Markdown文档**：\`${block.filename}\` (第${block.blockIndex}/${block.totalBlocks}块)`;
          
          // 添加文档类别的友好描述
          const categoryDesc = this.getCategoryDescription(block.category);
          if (categoryDesc) {
            content += `  \n> **文档类型**：${categoryDesc}`;
          }
          
          content += `  \n> **块标识**：\`${block.blockId}\` | **任务ID**：\`${block.taskUuid?.substring(0, 8)}...\`\n\n`;
        });
    }

    // 参考文档部分
    if (project.selectedDocuments.length > 0) {
      content += `## 📚 参考文档\n\n`;
      project.selectedDocuments
        .sort((a, b) => a.order - b.order)
        .forEach((doc, index) => {
          content += `${index + 1}. **Markdown文档**: \`${doc.filename}\``;
          content += ` - 来自任务: ${doc.taskTitle || 'Unknown Task'}\n`;
        });
      content += '\n';
    }

    // 引用清单
    content += `## 📝 引用清单\n\n`;
    let citationIndex = 1;

    project.selectedBlocks.forEach(block => {
      content += `${citationIndex}. **${block.taskTitle || 'Unknown Task'}** - Markdown文档 \`${block.filename}\` (第${block.blockIndex}块)`;
      if (block.timestamp) {
        const start = this.formatTime(block.timestamp.start);
        const end = this.formatTime(block.timestamp.end);
        content += ` [${start}-${end}]`;
      }
      
      // 添加文档类别描述
      const categoryDesc = this.getCategoryDescription(block.category);
      if (categoryDesc) {
        content += ` - ${categoryDesc}`;
      }
      
      content += '\n';
      citationIndex++;
    });

    project.selectedDocuments.forEach(doc => {
      content += `${citationIndex}. **${doc.taskTitle || 'Unknown Task'}** - 完整Markdown文档 \`${doc.filename}\`\n`;
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
          content += `> **来源任务**：${block.taskTitle}  \n`;
          content += `> **Markdown文档**：\`${block.filename}\` (第${block.blockIndex}/${block.totalBlocks}块)  \n`;
          
          // 添加文档类别的友好描述
          const categoryDesc = this.getCategoryDescription(block.category);
          if (categoryDesc) {
            content += `> **文档类型**：${categoryDesc}  \n`;
          }
          
          content += `> **块标识**：\`${block.blockId}\` | **任务ID**：\`${block.taskUuid?.substring(0, 8)}...\`  \n`;
          content += `> **收集时间**：${new Date(block.collectTime || block.addedAt).toLocaleString()}\n\n`;
        });
    }

    // 完整文档
    if (project.selectedDocuments.length > 0) {
      content += `## 完整文档\n\n`;
      project.selectedDocuments
        .sort((a, b) => a.order - b.order)
        .forEach((doc, index) => {
          content += `${index + 1}. **Markdown文档**: \`${doc.filename}\` - 来自任务: ${doc.taskTitle || doc.taskUuid?.substring(0, 8) + '...'}\n`;
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

  /**
   * 从localStorage加载项目数据
   */
  loadProjects() {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return projectsJson ? JSON.parse(projectsJson) : {};
    } catch (error) {
      console.error('加载项目数据失败:', error);
      return {};
    }
  }

  /**
   * 保存项目数据到localStorage
   */
  saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      return true;
    } catch (error) {
      console.error('保存项目数据失败:', error);
      return false;
    }
  }
}

// 单例实例
export const projectManager = new ProjectManager();
# 项目系统使用指南

## 🎯 系统概述

项目系统是一个强大的知识管理工具，允许用户从多个视频任务中收集有用的内容块和文档，组合成项目，然后发送给AI进行深度分析，最终导出为博客或Newsletter格式。

## 🏗️ 系统架构

### 核心组件

1. **ProjectManager** - 项目管理核心类
2. **ProjectBasket** - 右侧抽屉式项目收集篮
3. **CrossTaskBrowser** - 跨任务内容浏览器
4. **QuickCollector** - 块级快速收集按钮
5. **AIChat Integration** - AI聊天集成
6. **Export System** - 多格式导出系统

### 数据存储

- 使用localStorage进行前端持久化存储
- 支持项目版本管理和数据备份
- 自动保存和错误恢复

## 🚀 快速开始

### 1. 创建项目

```javascript
// 在浏览器控制台中测试
window.testProjectManager(); // 运行完整测试
```

### 2. 收集内容

- **方式一**：在BlockEditor中点击块旁边的"收集"按钮
- **方式二**：使用CrossTaskBrowser批量选择和收集
- **方式三**：拖拽文档到项目篮中

### 3. 管理项目

- 在ProjectBasket中查看收集的内容
- 拖拽重新排序
- 删除不需要的项目

### 4. AI分析

- 点击"发送到AI Chat"按钮
- 整个项目作为上下文发送给AI
- 进行深度分析和讨论

### 5. 导出结果

- Newsletter格式：适合发布
- Markdown格式：适合博客
- JSON格式：数据备份

## 📱 界面组件详解

### ProjectBasket（项目篮）

**位置**：右侧抽屉式面板

**功能**：
- 项目创建和切换
- 收集内容管理
- 统计信息显示
- 导出功能

**响应式设计**：
- 桌面端：96px宽度，可展开/收起
- 平板端：80px宽度
- 移动端：全屏模式

### CrossTaskBrowser（跨任务浏览器）

**布局**：
- 左侧：任务列表（1/3宽度）
- 右侧：文档和块内容（2/3宽度）

**性能优化**：
- 超过50个块时自动启用虚拟化渲染
- 搜索结果实时过滤
- 懒加载文档内容

### QuickCollector（快速收集器）

**触发方式**：
- 鼠标悬停在块上时显示
- 点击收集按钮
- 支持项目选择

**视觉反馈**：
- 收集中：蓝色加载动画
- 成功：绿色勾选图标（2秒）
- 失败：错误提示

## 🔧 API接口

### ProjectManager核心方法

```javascript
// 项目管理
projectManager.createProject(name, description)
projectManager.getProject(projectId)
projectManager.getAllProjects()
projectManager.deleteProject(projectId)

// 内容管理
projectManager.addBlock(projectId, blockData)
projectManager.addDocument(projectId, documentData)
projectManager.removeBlock(projectId, blockItemId)

// 统计和导出
projectManager.getProjectStats(projectId)
projectManager.exportProject(projectId, format)
```

### 数据结构

```javascript
// 项目结构
const project = {
  id: 'proj_abc123',
  name: '我的研究项目',
  description: '项目描述',
  selectedBlocks: [...],
  selectedDocuments: [...],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T15:30:00Z',
  version: '1.0'
};

// 块结构
const blockItem = {
  id: 'block_xyz789',
  taskUuid: 'task-uuid-123',
  taskTitle: '视频任务标题',
  filename: 'document.md',
  blockId: 'original-block-id',
  content: '块的实际内容...',
  timestamp: { start: 120, end: 180 },
  collectTime: '2024-01-15T14:00:00Z',
  order: 0
};
```

## 📤 导出格式

### Newsletter模板

```markdown
# 项目名称

> 项目描述
> 📊 本期内容：5个核心要点 + 3个参考文档
> 🗓️ 整理时间：2024-01-15

## 💡 核心要点

### 1. 第一个要点
内容...

> **来源**：视频A [02:30-03:15]
> **文件**：`summary.md`

## 📚 参考文档
1. **技术文档** - 来自 任务A
2. **用户手册** - 来自 任务B

## 📝 引用清单
1. 视频A - `summary.md` [02:30-03:15]
2. 技术文档 - `tech.md` (完整文档)

---
*本期内容基于我的项目研究，所有引用已标注出处*
```

### Markdown格式

```markdown
# 项目名称

> 创建时间：2024-01-15 10:00:00
> 最后更新：2024-01-15 15:30:00

## 收集内容

### 1. 重要发现
内容...

> **来源**：视频A - `summary.md` Block-001
> **任务ID**：task-abc123

## 完整文档
1. [技术文档] - 来自任务task-def456
```

## ⚡ 性能优化

### 虚拟化渲染

- 当块数量超过50个时自动启用
- 仅渲染可见区域的元素
- 支持平滑滚动和选择

### 内存管理

- 使用useMemo缓存过滤结果
- 及时清理事件监听器
- localStorage数据压缩

### 响应式设计

- 移动端优化布局
- 触摸友好的交互设计
- 自适应组件尺寸

## 🐛 错误处理

### 常见问题

1. **localStorage空间不足**
   - 自动清理过期数据
   - 提示用户手动清理

2. **网络请求失败**
   - 自动重试机制
   - 友好的错误提示

3. **数据格式错误**
   - 数据验证和修复
   - 降级处理方案

### 调试工具

```javascript
// 浏览器控制台调试
window.testProjectManager(); // 运行测试
window.cleanupTestData();    // 清理测试数据

// 查看localStorage数据
localStorage.getItem('yanghoo_projects');
localStorage.getItem('yanghoo_active_project');
```

## 🔄 集成指南

### 与现有系统集成

1. **BlockEditor集成**
   ```jsx
   import QuickCollector from './QuickCollector';
   
   // 在块操作菜单中添加
   <QuickCollector
     block={block}
     taskUuid={taskUuid}
     taskTitle="文档标题"
     filename="document.md"
     onCollected={handleCollected}
   />
   ```

2. **AIChat集成**
   ```jsx
   import ProjectBasket from './ProjectBasket';
   
   // 添加项目篮
   <ProjectBasket
     isVisible={showProjectBasket}
     onSendToAI={handleProjectSendToAI}
   />
   ```

### 自定义扩展

1. **自定义导出格式**
   ```javascript
   // 在ProjectManager中添加新的导出方法
   exportAsCustomFormat(project) {
     // 自定义导出逻辑
     return {
       content: customFormattedContent,
       filename: `${project.name}_Custom.txt`,
       stats: this.getProjectStats(project.id)
     };
   }
   ```

2. **自定义收集器**
   ```jsx
   // 创建特定场景的收集器
   const CustomCollector = ({ item, onCollect }) => {
     // 自定义收集逻辑
   };
   ```

## 📊 最佳实践

### 项目组织

1. **命名规范**
   - 使用描述性名称
   - 包含时间或版本信息
   - 避免特殊字符

2. **内容分类**
   - 按主题组织块
   - 区分核心观点和支撑材料
   - 保持逻辑顺序

3. **定期整理**
   - 删除过时项目
   - 合并相似内容
   - 导出重要成果

### 工作流程

1. **收集阶段**
   - 广泛收集，不要过早筛选
   - 保留原始上下文信息
   - 记录收集时的想法

2. **整理阶段**
   - 按重要性排序
   - 删除重复内容
   - 添加连接性文字

3. **分析阶段**
   - 发送给AI进行分析
   - 提出具体问题
   - 记录AI的洞察

4. **输出阶段**
   - 选择合适的导出格式
   - 完善引用信息
   - 发布或分享

## 🔮 未来规划

### 计划功能

1. **协作功能**
   - 项目分享和协作
   - 评论和标注系统
   - 版本控制

2. **智能功能**
   - AI自动分类和标签
   - 相关内容推荐
   - 智能摘要生成

3. **集成扩展**
   - 云端同步
   - 第三方工具集成
   - API开放平台

### 技术改进

1. **性能优化**
   - WebWorker后台处理
   - IndexedDB存储升级
   - 更高效的虚拟化

2. **用户体验**
   - 更丰富的动画效果
   - 键盘快捷键支持
   - 无障碍访问优化

## 📞 支持和反馈

如果在使用过程中遇到问题或有改进建议，请：

1. 查看浏览器控制台的错误信息
2. 运行测试函数验证功能
3. 检查localStorage数据完整性
4. 提供详细的复现步骤

---

**最后更新**：2024-01-15  
**版本**：v1.0.0 
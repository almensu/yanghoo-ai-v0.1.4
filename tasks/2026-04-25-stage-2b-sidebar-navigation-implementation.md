# 阶段 2B：侧边栏导航实施

你是 glm。只有当主控明确说“开始阶段 2B”后，才执行本任务。不要在阶段 2A 后自动开始。

用户的阶段 2 目标是：让侧边栏更清爽，并重新规划侧边栏，做到可以快速直达功能。

阶段 2B 基于阶段 2A 审计报告实施。实施前必须读取：

- `tasks/reports/2026-04-25-stage-2a-sidebar-navigation-audit.md`
- `frontend/src/App.js`
- `frontend/src/components/Sidebar.js`

## 强制约束

1. 不要提交 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要删除路由页面。
5. 不要移动 `frontend/src/pages/TestPage_*.js`，除非主控明确批准。
6. 不要改变后端代码。
7. 不要启动服务，除非主控明确要求。
8. 不要联网安装依赖。

## 目标

让侧边栏：

- 信息层级清楚
- 高频功能可快速直达
- 测试/开发入口不污染正式导航
- 菜单配置集中，后续新增入口更容易维护
- 保持现有路由可用，不破坏用户现有工作流

## 推荐实施方向

### 1. 新增集中导航配置

建议新增：

`frontend/src/config/navigation.js`

配置字段建议：

```js
{
  id: 'tasks',
  label: '任务',
  path: '/',
  icon: 'ListTodo',
  group: 'workspace',
  priority: 10,
  devOnly: false,
  hidden: false,
  description: '任务列表与处理进度'
}
```

分组建议：

- `workspace`：任务、工作台、高频入口
- `projects`：项目篮、文档、块编辑
- `media`：字幕、剪辑、视频相关
- `ai`：AI 对话或智能辅助
- `dev`：测试页、开发验证页

### 2. Sidebar 从配置渲染

改造 `frontend/src/components/Sidebar.js`：

- 从 `navigation.js` 读取分组和入口
- 使用 `lucide-react` 图标
- 当前路由高亮
- 高频入口放上方
- Dev/Test 分组默认折叠，或仅 `process.env.NODE_ENV === 'development'` 时显示
- 保持现有视觉风格，不做大规模 UI 重写

### 3. 测试入口处理

- 不删除测试页。
- 不移动测试页。
- 从正式一级导航中移除测试入口。
- 统一放入 `开发测试` 分组。
- 如果测试入口过多，默认折叠。

### 4. 快速直达

至少保证这些能力能从侧边栏快速到达：

- 任务列表
- Studio/工作台
- 项目或项目篮相关功能
- 字幕/剪辑相关功能
- AI 对话或智能辅助入口，如果当前已有对应页面/组件

不要凭空创建没有功能支撑的新页面。

## 验收要求

实施后必须提供：

1. 修改文件列表。
2. `git status --short --untracked-files=all`。
3. 路由和菜单对应关系摘要。
4. 哪些入口被放入正式导航，哪些入口被放入开发测试分组。
5. 验证结果：
   - 如果 `frontend/node_modules` 存在，运行 `npm run build`。
   - 如果不存在，不要联网安装，说明未运行原因。
   - 至少做静态检查，确认 `Sidebar.js` import 不缺失，`navigation.js` 被正确引用。
6. 未处理风险。
7. 明确说明没有 commit、没有 push。

## 主控验收方式

主控会独立扫描：

- `git status`
- `frontend/src/components/Sidebar.js`
- `frontend/src/config/navigation.js`
- `frontend/src/App.js`
- 菜单配置中的 path 是否在 App 路由中存在
- 是否有测试页仍污染正式一级导航
- 是否有缺失 import 或明显构建风险

若报告与实际文件不一致，主控会要求返工。


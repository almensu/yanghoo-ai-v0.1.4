# 阶段 2C：侧边栏构建验证与兼容性修补

你是 glm。只有当主控明确说“开始阶段 2C”后，才执行本任务。

阶段 2B 已完成侧边栏导航改造：

- 新增 `frontend/src/config/navigation.js`
- 修改 `frontend/src/components/Sidebar.js`
- `App.js` 路由保持不动

阶段 2C 的目标是验证 2B 是否能编译和基本运行，并只修补与侧边栏导航相关的问题。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要擅自联网安装依赖。
5. 不要改后端代码。
6. 不要扩大重构范围。
7. 不要删除路由页面。
8. 不要移动 `frontend/src/pages/TestPage_*.js`。

## 执行顺序

### Step 1 - 初始扫描

记录：

- `git status --short --untracked-files=all`
- `frontend/node_modules` 是否存在
- `frontend/package.json` 中 `lucide-react` 版本
- `frontend/src/config/navigation.js` 当前使用的 lucide 图标名

### Step 2 - 判断是否能构建

如果 `frontend/node_modules` 不存在：

- 不要运行 `npm install`
- 不要运行 `npm ci`
- 不要联网
- 在报告里写明无法构建的原因
- 仍然做静态检查

如果 `frontend/node_modules` 存在：

- 在 `frontend/` 下运行 `npm run build`
- 记录完整结果摘要
- 如果失败，只修复与 `Sidebar.js`、`navigation.js` 直接相关的问题

### Step 3 - 静态检查

无论能否 build，都必须做这些检查：

- `navigation.js` 中所有 path 是否都能在 `App.js` 找到对应 route
- `Sidebar.js` 是否只从 `navigationConfig` 渲染菜单，不再保留旧 `menuItems`
- `Sidebar.js` 是否还包含 `/docs`
- 正式导航是否只有 `任务列表`
- 开发测试入口是否在 `dev` 分组，默认折叠
- 是否存在缺失 import 或明显未使用变量

### Step 4 - lucide 图标兼容性检查

重点检查这些图标是否可能不可用：

- `FlaskConical`
- `Subtitles`
- `Captions`
- `MousePointerClick`
- `FileInput`
- `Blocks`
- `ListTodo`

如果 build 报某个图标不存在：

- 不要升级依赖
- 用当前项目已用过或更常见的 lucide 图标替换
- 替换后重新 build
- 在报告中记录替换原因

优先替代建议：

- `FlaskConical` -> `Settings`
- `Subtitles` -> `FileText`
- `Captions` -> `FileText`
- `MousePointerClick` -> `MousePointer`
- `FileInput` -> `FileText`
- `Blocks` -> `Box`
- `ListTodo` -> `List`

### Step 5 - 可选本地运行

只有在依赖已存在、且 build 通过时，才可以运行前端本地服务做人工验收。

如果需要启动服务：

- 优先使用已有项目脚本或 `npm start`
- 不要长期占用进程，完成验收后说明进程状态
- 若主控未明确要求启动服务，可以跳过

## 可修改范围

允许修改：

- `frontend/src/config/navigation.js`
- `frontend/src/components/Sidebar.js`
- `tasks/reports/2026-04-25-stage-2c-sidebar-build-verification.md`

不要修改：

- `frontend/src/App.js`
- `frontend/src/pages/`
- 后端文件
- 阶段 1/2A/2B 报告，除非只是引用本阶段验证结果且主控要求

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-2c-sidebar-build-verification.md`

报告必须包含：

- `初始状态`
- `依赖状态`
- `构建验证`
- `静态检查`
- `图标兼容性`
- `实际修补`
- `最终 git status`
- `未处理风险`
- `给主控的验收提示`

## 最终回复主控

完成后回复：

- 报告文件路径
- 是否运行了 `npm run build`
- build 是否通过
- 如果没跑 build，原因是什么
- 修改了哪些文件
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push


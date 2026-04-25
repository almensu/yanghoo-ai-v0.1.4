# 阶段 3E 执行报告：可访问性 anchor warning 修复

执行日期：2026-04-25
执行者：Claude (glm)

## 初始状态

- 工作区干净（3D 已提交为 `2e9a0fd` + `476c990`）
- 分支：`wt-0.2.0`
- 3D 报告记录 99 条 warning

## 目标 warning

| # | 文件 | 行号 | 规则 |
|---|------|------|------|
| 1 | CardView.js | 136 | jsx-a11y/anchor-is-valid |
| 2 | CardView.js | 264 | jsx-a11y/anchor-is-valid |
| 3 | TableView.js | 236 | jsx-a11y/anchor-is-valid |
| 4 | TaskList.js | 68 | jsx-a11y/anchor-is-valid |
| 5 | TaskList.js | 69 | jsx-a11y/anchor-is-valid |

## 实际修改

### 1. CardView.js:136 — 排序下拉菜单项

```jsx
// Before
<a onClick={...} className={...}>

// After
<button type="button" onClick={...} className={...}>
```

daisyUI `menu > li > button` 样式与 `menu > li > a` 一致，视觉不变。

### 2. CardView.js:264 — 下载视频质量选项

```jsx
// Before
<li key={quality}><a className="text-xs" onClick={...}>{quality}</a></li>

// After
<li key={quality}><button type="button" className="text-xs" onClick={...}>{quality}</button></li>
```

同上，daisyUI menu 内的 button 与 a 样式一致。

### 3. TableView.js:236 — 下载视频质量选项

与 CardView.js:264 相同模式的修复。

### 4-5. TaskList.js:68-69 — 视图模式切换标签

```jsx
// Before
<a className={`tab ${...}`} onClick={...}>Card View</a>
<a className={`tab ${...}`} onClick={...}>Table View</a>

// After
<button type="button" className={`tab ${...}`} onClick={...}>Card View</button>
<button type="button" className={`tab ${...}`} onClick={...}>Table View</button>
```

daisyUI `tab` 类同时支持 `<a>` 和 `<button>` 元素，样式一致。

## 行为等价说明

- 所有 `<a>` 均无 `href`，本质是交互按钮而非导航链接
- 改为 `<button type="button">` 后语义正确，键盘可聚焦，不触发表单 submit
- daisyUI 的 `menu > li > button`、`tab` 类对 `<button>` 和 `<a>` 渲染一致
- onClick 处理函数和 className 完全保留

## 构建验证

**`npm run build` 成功。**

主控复跑 `cd frontend && npm run build` 成功，`anchor-is-valid` warning 不再出现；剩余 warning 为历史 unused/hooks/css minimizer 等。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| 5 条 `jsx-a11y/anchor-is-valid` 消失 | pass |
| 不新增 warning | pass |
| 不新增 Sidebar/navigation warning | pass |

## warning 变化

| 规则 | 3D | 3E | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 82 | 82 | 不变 |
| `react-hooks/exhaustive-deps` | 12 | 12 | 不变 |
| `jsx-a11y/anchor-is-valid` | 5 | 0 | **-5（消除）** |
| `no-useless-escape` | 0 | 0 | 不变 |
| `no-mixed-operators` | 0 | 0 | 不变 |
| `import/no-anonymous-default-export` | 0 | 0 | 不变 |
| **合计** | **99** | **94** | **-5** |

## 最终 git status

```
 M frontend/src/components/CardView.js
 M frontend/src/components/TableView.js
 M frontend/src/components/TaskList.js
?? tasks/2026-04-25-stage-3e-a11y-anchor-fixes.md
?? tasks/reports/2026-04-25-stage-3e-a11y-anchor-fixes.md
```

## 本地产物清理

主控复验后发现 `tasks/.DS_Store`，已清理。`.DS_Store` 受 `.gitignore` 覆盖，不应纳入提交。

## 风险和回滚点

| 项 | 说明 |
|----|------|
| 回滚方式 | `git checkout -- frontend/src/components/CardView.js frontend/src/components/TableView.js frontend/src/components/TaskList.js` |
| 视觉风险 | 低——daisyUI menu/tab 组件对 button 和 a 一视同仁 |
| 行为风险 | 零——onClick 完全保留，type="button" 阻止默认 submit |
| 未 commit/push | 所有变更仅在工作区 |

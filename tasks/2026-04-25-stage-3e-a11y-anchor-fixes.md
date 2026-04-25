# 阶段 3E：可访问性 anchor warning 修复

你是 glm。阶段 3D 已处理低风险语法 warning。阶段 3E 只处理 5 条 `jsx-a11y/anchor-is-valid` warning。

## 目标

修复无效 `<a>` 标签，提升键盘访问和语义正确性：

- `frontend/src/components/CardView.js`：2 条
- `frontend/src/components/TableView.js`：1 条
- `frontend/src/components/TaskList.js`：2 条

本阶段预计减少 5 条 warning。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 `no-unused-vars`。
5. 不要处理 hooks dependency warning。
6. 不要处理 CSS minimizer warning。
7. 不要升级依赖。
8. 不要修改后端。
9. 不要重构组件结构。
10. 不要改变点击行为。

## 允许修改的文件

只允许修改：

- `frontend/src/components/CardView.js`
- `frontend/src/components/TableView.js`
- `frontend/src/components/TaskList.js`
- `tasks/reports/2026-04-25-stage-3e-a11y-anchor-fixes.md`

如果 warning 位置变化，先定位同一类无效 `<a>`，不要扩大到其他 warning。

## 具体修复范围

目标 warning：

```text
src/components/CardView.js
  Line 136:17 anchor-is-valid
  Line 264:49 anchor-is-valid

src/components/TableView.js
  Line 236:48 anchor-is-valid

src/components/TaskList.js
  Line 68:11 anchor-is-valid
  Line 69:11 anchor-is-valid
```

## 修复要求

### 推荐修法

将没有有效 `href` 的 `<a>` 改为 `<button type="button">`。

要求：

- 保持原有 `onClick` 行为。
- 保持原有 className / tooltip / 图标 / 文案。
- 如果原来依赖 `<a>` 的 DaisyUI 样式，确认改成 `<button>` 后 className 仍可用。
- 添加 `type="button"`，避免在表单环境里默认 submit。
- 不要使用 `href="#"` 作为主要修法，除非改成 button 明显破坏样式。

### 示例

```jsx
// Before
<a className="btn btn-ghost" onClick={handleClick}>
  ...
</a>

// After
<button type="button" className="btn btn-ghost" onClick={handleClick}>
  ...
</button>
```

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- 5 条 `jsx-a11y/anchor-is-valid` warning 消失
- 不新增 warning
- 点击行为从代码层面保持一致
- 不新增 Sidebar/navigation warning

如果 build 失败或新增 warning：

- 只修本阶段范围内的问题。
- 如果问题超出范围，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3e-a11y-anchor-fixes.md`

报告必须包含：

- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `最终 git status`
- `风险和回滚点`

## 最终回复主控

完成后回复：

- 报告文件路径
- 修改了哪些文件
- `npm run build` 是否成功
- 目标 5 条 warning 是否消失
- 是否新增 warning
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push


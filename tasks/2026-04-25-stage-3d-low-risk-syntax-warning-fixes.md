# 阶段 3D：低风险语法与导出 warning 修复

你是 glm。阶段 3C 已修复真实风险 warning。阶段 3D 处理低风险、局部、行为等价的语法/导出 warning。

## 目标

消除这些低风险 warning：

1. `no-useless-escape`：5 条
2. `no-mixed-operators`：4 条
3. `import/no-anonymous-default-export`：1 条

本阶段预计减少 10 条 warning。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 `no-unused-vars`。
5. 不要处理 hooks dependency warning。
6. 不要处理 a11y anchor warning。
7. 不要处理 CSS minimizer warning。
8. 不要升级依赖。
9. 不要修改后端。
10. 不要重构大组件。

## 允许修改的文件

只允许修改：

- `frontend/src/components/Studio.js`
- `frontend/src/components/TableView.js`
- `frontend/src/utils/timestampUtils.js`
- `tasks/reports/2026-04-25-stage-3d-low-risk-syntax-warning-fixes.md`

如果发现 `no-mixed-operators` 不在 `TableView.js`，或目标 warning 位置变化，先报告主控，不要扩大范围。

## 具体修复范围

### 1. `Studio.js`：修复 4 条 `no-useless-escape`

目标 warning：

- `Studio.js:658` 两条
- `Studio.js:667` 两条

要求：

- 只删除正则或字符串中不必要的 `\[`。
- 不改变匹配语义。
- 修改前后对照上下文，确认不是必须保留的转义。

### 2. `timestampUtils.js`：修复 1 条 `no-useless-escape`

目标 warning：

- `timestampUtils.js:80`

要求：

- 只删除不必要的 `\.` 或等价多余转义。
- 不改变解析语义。

### 3. `TableView.js`：修复 4 条 `no-mixed-operators`

目标 warning：

- `TableView.js:332` 两条
- `TableView.js:335` 两条

要求：

- 只加括号明确 `&&` 和 `||` 的优先级。
- 不改变逻辑。
- 修改前先确认 JS 默认优先级：`&&` 高于 `||`。

### 4. `timestampUtils.js`：修复 `import/no-anonymous-default-export`

目标 warning：

- `timestampUtils.js:361`

要求：

- 将匿名默认导出的对象先赋值给命名常量，再 `export default`。
- 不改变任何 named exports。
- 不改变导入方 API。

推荐写法：

```js
const timestampUtils = {
  ...
};

export default timestampUtils;
```

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- 目标 5 条 `no-useless-escape` 消失
- 目标 4 条 `no-mixed-operators` 消失
- `import/no-anonymous-default-export` 消失
- 不新增 warning
- 不新增 Sidebar/navigation warning

如果 build 失败或新增 warning：

- 只修本阶段范围内的问题。
- 如果问题超出范围，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3d-low-risk-syntax-warning-fixes.md`

报告必须包含：

- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `暂缓项`
- `最终 git status`
- `风险和回滚点`

## 最终回复主控

完成后回复：

- 报告文件路径
- 修改了哪些文件
- `npm run build` 是否成功
- 目标 10 条 warning 是否消失
- 是否新增 warning
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push


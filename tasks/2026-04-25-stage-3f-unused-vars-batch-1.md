# 阶段 3F：unused vars 第一批清理

你是 glm。阶段 3E 已修复 a11y anchor warning。阶段 3F 开始清理 `no-unused-vars`，但必须分批、小范围、低风险。

## 目标

清理第一批明显未使用的 imports / variables，优先选择：

- 纯 unused imports
- 明显未使用的局部变量
- 不涉及业务流程的 UI 图标 imports

不要一次性清完 82 条。

## 本阶段范围

只处理这些文件中的 `no-unused-vars`：

- `frontend/src/components/MarkdownViewer.js`
- `frontend/src/components/QuickCollector.js`
- `frontend/src/components/VttPreviewer.js`
- `frontend/src/components/TaskList.js`
- `frontend/src/pages/TaskListPage.js`
- `frontend/src/components/CardView.js`
- `frontend/src/components/TableView.js`

预计处理：

- `MarkdownViewer.js`：未使用的 React hooks 和 token 工具 import
- `QuickCollector.js`：`isHovered`
- `VttPreviewer.js`：`WebVTTParser`、`formatTime`
- `TaskList.js`：`setSearchTerm`
- `TaskListPage.js`：`data`
- `CardView.js` / `TableView.js`：明显未使用的 lucide icon imports、`rawSrtFilesExist`

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 hooks dependency warning。
5. 不要处理 CSS minimizer warning。
6. 不要升级依赖。
7. 不要修改后端。
8. 不要改动函数行为。
9. 不要删除看似未使用但可能是未来功能占位的大块逻辑，除非 build 明确指出 unused 且上下文确认安全。
10. 不要处理 `Studio.js`、`VideoPlayer.js`、`StudioWorkSpace.js`、`AIChat.js`、`BlockEditor.js`、`ProjectBubble.js` 中的 unused warning；这些留给后续批次。

## 允许修改的文件

只允许修改：

- `frontend/src/components/MarkdownViewer.js`
- `frontend/src/components/QuickCollector.js`
- `frontend/src/components/VttPreviewer.js`
- `frontend/src/components/TaskList.js`
- `frontend/src/pages/TaskListPage.js`
- `frontend/src/components/CardView.js`
- `frontend/src/components/TableView.js`
- `tasks/reports/2026-04-25-stage-3f-unused-vars-batch-1.md`

如果 build 输出显示目标 warning 行号变化，可以在这些文件内处理同类 warning。

## 修复策略

### 1. imports

- 删除未使用 import。
- 如果一个 import specifier 未使用，只删除该 specifier，不删除整个 import 语句。
- 保持 import 顺序大体不变，不做格式化大改。

### 2. unused state setter / local variable

- 如果是 `const [value, setValue] = useState(...)` 中 setter 未使用，但 value 使用了：
  - 可以改成 `const [value] = useState(...)`
  - 但先确认 React hooks 顺序不变。
- 如果是局部变量赋值后完全未使用：
  - 删除变量声明。
  - 如果赋值表达式有副作用，不要删除表达式；先报告。

### 3. unused derived booleans

- 例如 `rawSrtFilesExist` 这类派生布尔值：
  - 若完全未使用且计算无副作用，可删除。
  - 不改变周边条件逻辑。

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- 本阶段目标文件中的 `no-unused-vars` warning 消失或明显减少
- 不新增 warning
- 不新增 hooks warning
- 不新增 Sidebar/navigation warning

如果出现行为相关风险或 build 失败：

- 只修本阶段范围内的问题。
- 如果问题超出范围，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3f-unused-vars-batch-1.md`

报告必须包含：

- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `未处理 unused vars`
- `最终 git status`
- `风险和回滚点`

## 最终回复主控

完成后回复：

- 报告文件路径
- 修改了哪些文件
- `npm run build` 是否成功
- 清理了多少条 `no-unused-vars`
- 是否新增 warning
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push


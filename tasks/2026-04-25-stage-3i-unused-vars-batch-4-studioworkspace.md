# 阶段 3I：unused vars 第四批清理（StudioWorkSpace）

你是 glm。阶段 3H 已清理核心组件 `Studio.js` / `VideoPlayer.js` 的 unused vars。阶段 3I 只处理 `StudioWorkSpace.js` 中剩余的 `no-unused-vars`，不碰 hooks。

## 执行前硬性检查

开始前必须运行：

```bash
git status --short --untracked-files=all
git log --oneline -3
```

如果工作区不干净，且不只是本任务提示词/报告相关文件：

- 立即停止
- 不要修改前端代码
- 回复主控说明当前未提交变更

## 目标

清理 `frontend/src/components/StudioWorkSpace.js` 中明显未使用的 imports / state / functions / local variables。

阶段 3H 后剩余 warning 约 25 条，其中 `no-unused-vars` 约 13 条，主要集中在 `StudioWorkSpace.js`。本阶段目标是消除这些 unused warning。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 hooks dependency warning。
5. 不要处理 CSS minimizer warning。
6. 不要升级依赖。
7. 不要修改后端。
8. 不要重构 `StudioWorkSpace.js`。
9. 不要删除有副作用的代码。
10. 不要修改 `StudioWorkSpaceEnhanced.js`，除非 build 明确显示目标 warning 不在 `StudioWorkSpace.js` 且主控另行批准。

## 允许修改的文件

只允许修改：

- `frontend/src/components/StudioWorkSpace.js`
- `tasks/reports/2026-04-25-stage-3i-unused-vars-batch-4-studioworkspace.md`

如果发现必须修改其他文件，停止并报告主控。

## 预期清理项

根据之前 build 输出，`StudioWorkSpace.js` 可能包含这些 unused warning：

- `TimestampFormatTest`
- `jsPDF`
- `chineseFontBase64`
- `selectedDocFile`
- `setSelectedDocFile`
- `isLoadingDocFiles`
- `currentEditMode`
- `scrollPosition`
- `updateDocFile`
- `deleteDocFile`
- `getDocFileContent`
- `getDocFileBlocks`
- `filename`

实际行号可能已变化，以当前 `npm run build` 输出为准。

## 修复策略

### imports

- 删除未使用 import。
- 不做 import 排序大改。
- 如果删除 import 影响注释或未来功能，不保留死 import；在报告中记录。

### useState

- 如果 state value 和 setter 都未使用，删除整组 `useState`。
- 如果只 setter 未使用但 value 使用，改为单元素解构。
- 如果 setter 被异步函数使用但 value 未使用，保留 setter：`const [, setX] = useState(...)`。

### functions

- 只删除完全无调用点、且函数体没有被外部引用的函数。
- 删除前用文件内搜索确认无 JSX/回调/props 使用。
- 如果函数内有 API 调用或副作用，但函数本身无调用点，可以删除；报告中记录。

### local variables

- 如果局部变量赋值表达式无副作用且未使用，删除。
- 如果赋值表达式有副作用，保留表达式，不保留变量名。

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- `StudioWorkSpace.js` 中目标 `no-unused-vars` warning 消失或明显减少
- 不新增 warning
- 不新增 hooks warning
- 不新增 Sidebar/navigation warning

如果 build 失败或新增 warning：

- 只修本阶段范围内的问题。
- 如果问题超出范围，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3i-unused-vars-batch-4-studioworkspace.md`

报告必须包含：

- `执行前检查`
- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `未处理 warning`
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


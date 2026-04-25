# 阶段 3J：React hooks warning 审计

你是 glm。阶段 3I 已清零 `no-unused-vars`。当前 build 主要剩余 12 条 `react-hooks/exhaustive-deps` warning，以及 CSS/tooling warning。阶段 3J 只做 hooks warning 审计，不修代码。

## 目标

逐条分析剩余 hooks warning，判断：

- 是否是真 bug 风险
- 当前闭包行为是否有意
- 推荐修法是什么
- 是否适合阶段 3K 修复
- 是否需要浏览器回归测试

## 强制约束

1. 不要修改前端代码。
2. 不要 commit。
3. 不要 push。
4. 不要改写历史。
5. 不要处理 CSS minimizer warning。
6. 不要升级依赖。
7. 不要修改后端。

## 执行前检查

运行：

```bash
git status --short --untracked-files=all
git log --oneline -3
```

如果工作区不干净，停止并报告主控。

## 执行步骤

### Step 1 - 构建采样

运行：

```bash
cd frontend
npm run build
```

记录当前 hooks warning 列表，包括文件、行号、warning 文案。

### Step 2 - 逐条阅读上下文

至少阅读每条 warning 周围 40-80 行上下文。

当前预期文件包括：

- `frontend/src/components/AIChat.js`
- `frontend/src/components/BlockEditor.js`
- `frontend/src/components/MarkdownWithTimestamps.js`
- `frontend/src/components/Studio.js`
- `frontend/src/components/StudioWorkSpace.js`
- `frontend/src/components/VideoPlayer.js`
- `frontend/src/components/VttPreviewer.js`

### Step 3 - 分类

将每条 warning 分为：

1. **P0 真 bug 风险**
   - 可能导致数据不刷新、事件监听旧闭包、状态不同步

2. **P1 应修复**
   - 可通过 `useCallback`、局部变量、依赖调整低风险修复

3. **P2 可暂缓**
   - 当前行为可能是有意闭包，修复需要更大回归

4. **P3 建议保留并注释**
   - eslint 规则无法表达当前意图，最好加注释解释

### Step 4 - 推荐修法

对每条 warning 给出：

- 推荐修法
- 涉及文件
- 预计改动范围
- 行为风险
- 是否需要浏览器验收
- 是否建议自动修复

可选修法类型：

- 将函数包进 `useCallback`
- 将逻辑移动到 `useEffect` 内
- 在 effect 内捕获局部变量
- 使用 `useRef` 保存最新 callback
- 补齐依赖数组
- 保留现状并加 `eslint-disable-next-line` 注释

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md`

报告必须包含：

- `执行前检查`
- `构建结果`
- `hooks warning 列表`
- `逐条分析`
- `风险分级`
- `推荐修复顺序`
- `阶段 3K 建议`
- `不建议立即修的项`
- `最终 git status`

## 最终回复主控

完成后回复：

- 报告文件路径
- 当前 hooks warning 总数
- P0/P1/P2/P3 数量
- 推荐 3K 先修哪些
- 当前 `git status --short --untracked-files=all`
- 明确没有修改前端代码、没有 commit/push


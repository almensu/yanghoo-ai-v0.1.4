# 阶段 3D 执行报告：低风险语法与导出 warning 修复

执行日期：2026-04-25
执行者：Claude (glm)

## 初始状态

- 工作区干净（3C 已提交为 `47188a3` + `b1598b6`）
- 分支：`wt-0.2.0`
- 3C 报告记录 109 条 warning

## 目标 warning

| # | 文件 | 行号 | 规则 | 数量 |
|---|------|------|------|------|
| 1 | Studio.js | 658 | no-useless-escape | 2 |
| 2 | Studio.js | 667 | no-useless-escape | 2 |
| 3 | timestampUtils.js | 80 | no-useless-escape | 1 |
| 4 | TableView.js | 332 | no-mixed-operators | 2 |
| 5 | TableView.js | 335 | no-mixed-operators | 2 |
| 6 | timestampUtils.js | 361 | import/no-anonymous-default-export | 1 |
| **合计** | | | | **10** |

## 实际修改

### 1. Studio.js — no-useless-escape (4 条)

字符类 `[]` 中 `[` 不需要转义，`\]` 仍需保留（否则会提前闭合字符类）。

```js
// Before (×2 出现)
/^[a-zA-Z0-9\s\[\].,!?'"()-]+$/
/[^\w\s\[\].,!?'"()-]/g

// After
/^[a-zA-Z0-9\s[\].,!?'")(-]+$/
/[^\w\s[\].,!?'")(-]/g
```

**行为等价**：在字符类内部 `[` 本身就是字面量，无需 `\` 转义。`\]` 保留，因为 `]` 在字符类内表示闭合。

**返工说明**：主控验收发现第一次修复错误，将 `\]` 后的 `.,!?` 等字符放到了字符类外，改变了正则语义。已修正为行为等价版本：只把无用的 `\[` 改为 `[`，保留 `\]`，并保持 `.,!?'")(-` 仍在同一个字符类中。

### 2. timestampUtils.js:80 — no-useless-escape (1 条)

字符类 `[:]` 中 `.` 本身就是字面量。

```js
// Before
cleanTimeStr.replace(/[:\.]{2,}/g, ':')

// After
cleanTimeStr.replace(/[:.]{2,}/g, ':')
```

**行为等价**：`.` 在字符类内是字面量点号，与转义后完全相同。

### 3. TableView.js:332,335 — no-mixed-operators (4 条)

JS 中 `&&` 优先级高于 `||`，原代码语义正确但缺少显式括号。

```js
// Before (line 332)
(!vttEnExists && !vttZhExists || task.archived) && "btn-disabled"

// After
((!vttEnExists && !vttZhExists) || task.archived) && "btn-disabled"

// Before (line 335)
disabled={!vttEnExists && !vttZhExists || task.archived}

// After
disabled={(!vttEnExists && !vttZhExists) || task.archived}
```

**行为等价**：括号仅显式化已有优先级，不改变求值顺序。

### 4. timestampUtils.js:361 — import/no-anonymous-default-export (1 条)

```js
// Before
export default {
  timeToSeconds,
  ...
};

// After
const timestampUtils = {
  timeToSeconds,
  ...
};

export default timestampUtils;
```

**行为等价**：导入方 API 不变，`import xxx from '...'` 和 `import { timeToSeconds } from '...'` 均正常工作。named exports 未改动。

## 构建验证

**`npm run build` 成功。**

主控发现 Studio.js 正则第一次修复错误后，已修正并复跑 `cd frontend && npm run build`，build 成功。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| `no-useless-escape` 5 条消失 | pass |
| `no-mixed-operators` 4 条消失 | pass |
| `import/no-anonymous-default-export` 消失 | pass |
| 不新增 warning | pass |
| 不新增 Sidebar/navigation warning | pass |

## warning 变化

| 规则 | 3C | 3D | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 82 | 82 | 不变 |
| `react-hooks/exhaustive-deps` | 12 | 12 | 不变 |
| `jsx-a11y/anchor-is-valid` | 5 | 5 | 不变 |
| `no-useless-escape` | 5 | 0 | **-5（消除）** |
| `no-mixed-operators` | 4 | 0 | **-4（消除）** |
| `no-cond-assign` | 0 | 0 | 不变 |
| `import/no-anonymous-default-export` | 1 | 0 | **-1（消除）** |
| **合计** | **109** | **99** | **-10** |

## 暂缓项

无新增暂缓项。历史暂缓项（no-unused-vars、hooks、a11y）不在本阶段范围。

## 最终 git status

```
 M frontend/src/components/Studio.js
 M frontend/src/components/TableView.js
 M frontend/src/utils/timestampUtils.js
?? tasks/2026-04-25-stage-3d-low-risk-syntax-warning-fixes.md
?? tasks/reports/2026-04-25-stage-3d-low-risk-syntax-warning-fixes.md
```

## 风险和回滚点

| 项 | 说明 |
|----|------|
| 回滚方式 | `git checkout -- frontend/src/components/Studio.js frontend/src/components/TableView.js frontend/src/utils/timestampUtils.js` |
| useless-escape | 零风险，仅删除字符类内无用的 `\` |
| mixed-operators | 零风险，括号仅显式化已有优先级 |
| anonymous-export | 零风险，命名常量+重新导出，API 不变 |
| 未 commit/push | 所有变更仅在工作区 |

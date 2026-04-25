# 阶段 3L：最终构建清理 (Final Build Cleanup)

你是 glm。在 Stage 3K-C 完成后，前端构建仅剩 2 条“有意为之”的 `react-hooks/exhaustive-deps` 告警。本阶段的目标是通过添加精准的 `eslint-disable` 注释及理由，彻底消除构建告警，实现 `Zero Warnings`。

## 背景

当前状态：
- 3K-C 已完成，大部分复杂 Hooks 告警已修复。
- 剩余 2 条告警属于：
  1. `Studio.js:1171` — `displayLang` 被有意排除以优化性能。
  2. `VttPreviewer.js:178` — `videoRef.current` 是 mutable ref，不应作为依赖。

参考审计报告：
- `tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md` (分析了这两条告警的风险等级为 P2/P3)。

## 目标

1. 在不改变业务逻辑的前提下，通过 `eslint-disable-next-line` 消除剩余 2 条告警。
2. 确保注释清晰说明了排除依赖的架构设计理由。
3. 实现 `npm run build` 成功，且无任何 eslint warning。

## 强制约束

1. **禁止**为了消除告警而将 `displayLang` 加入 `Studio.js` 的大数据获取 Effect（这会导致切换语言时重复请求 API）。
2. **禁止**将 `videoRef.current` 保留在依赖数组中。
3. **只修改**本任务指定的 2 行代码。
4. **不要** commit 或 push。

## 执行步骤

### Step 1 - 确认基线
进入 `frontend` 目录运行 `npm run build`，确认当前仅剩 2 条目标告警。

### Step 2 - 处理 Studio.js
文件：`frontend/src/components/Studio.js`
位置：约 1171 行（大型 `fetchData` Effect 的依赖数组处）。
动作：
1. 在依赖数组 `[taskUuid, apiBaseUrl]` 上方添加注释。
2. 使用 `eslint-disable-next-line`。
示例：
```javascript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [taskUuid, apiBaseUrl]); // 有意排除 displayLang 以避免切换语言时重新触发昂贵的数据获取
```

### Step 3 - 处理 VttPreviewer.js
文件：`frontend/src/components/VttPreviewer.js`
位置：约 178 行。
动作：
1. 从依赖数组中**移除** `videoRef.current`。
2. 在该行上方添加注释说明。
示例：
```javascript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [videoRef, handleTimeUpdateThrottled, timeUpdateLogic]); // videoRef.current 是 mutable ref，不应作为依赖
```

### Step 4 - 最终验证
运行 `npm run build`。
验收标准：
- 输出 `Compiled successfully.`。
- 无任何 `react-hooks/exhaustive-deps` 遗留。

## 报告要求
将报告写入：`tasks/reports/2026-04-25-stage-3l-final-build-cleanup.md`。
需包含：
- 修改前后的代码对比。
- 构建结果日志摘录。
- 确认当前项目已达到零告警状态。

## 最终回复主控
完成后回复：
- 是否实现零告警构建。
- 报告路径。
- `git status --short`。

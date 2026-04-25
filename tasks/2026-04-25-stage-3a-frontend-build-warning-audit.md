# 阶段 3A：前端构建 warning 审计

你是 glm。阶段 2 已完成侧边栏导航重构，并已通过 `npm run build`，但构建输出中存在大量历史 warning。阶段 3A 只做只读审计，不修代码。

## 目标

对前端 `npm run build` 的 warning 做工程化分类，明确哪些应该优先修、哪些可以暂缓、哪些属于测试页/历史遗留。

本阶段产出是一份审计报告，供阶段 3B/3C 制定修复计划。

## 强制约束

1. 不要修改代码。
2. 不要提交 commit。
3. 不要 push。
4. 不要改写历史。
5. 不要删除 `frontend/build/`。
6. 不要安装或升级依赖，除非主控明确批准。
7. 不要处理后端。

## 执行步骤

### Step 1 - 初始状态

记录：

- `git status --short --untracked-files=all`
- 最近 3 个 commit
- `frontend/node_modules` 是否存在
- `frontend/package.json` 的主要脚本

### Step 2 - 运行构建

在 `frontend/` 下运行：

```bash
npm run build
```

记录：

- build 是否成功
- warning 总体规模
- warning 涉及哪些文件
- 是否有与阶段 2 侧边栏相关的 warning

### Step 3 - warning 分类

把 warning 分类到这些桶：

1. **测试页命名问题**
   - 例如 `App.js` 中 `TestPage_*` 不符合 `react/jsx-pascal-case`
   - 判断是否适合阶段 3B 处理

2. **React hooks dependency**
   - `react-hooks/exhaustive-deps`
   - 区分真实风险和仅需稳定 callback 的低风险项

3. **未使用变量/import**
   - `no-unused-vars`
   - 区分删除即可、可能代表未完成代码、暂不建议动

4. **可访问性**
   - `jsx-a11y/anchor-is-valid`
   - 判断是否影响键盘访问或语义

5. **表达式/语法清晰度**
   - `no-mixed-operators`
   - `no-cond-assign`
   - `no-useless-escape`

6. **CSS/minifier warning**
   - `postcss-calc:: Lexical error ... infinity * 1px`
   - 找到触发位置和可能来源，但不修

7. **依赖/工具链 warning**
   - Browserslist/caniuse-lite 过期
   - 说明需要联网更新，不在本阶段处理

### Step 4 - 修复优先级建议

给出推荐顺序：

- P0：可能导致运行错误或逻辑 bug
- P1：构建质量或用户体验明显受影响
- P2：维护性清理，可小步做
- P3：暂缓或需要产品判断

每个建议要包含：

- 文件路径
- warning 类型
- 为什么优先级是这个
- 建议修法
- 是否适合自动修
- 是否需要浏览器验收

### Step 5 - 阶段 3B/3C 切分建议

输出下一步建议：

- 3B：建议先修哪些测试页/路由命名问题
- 3C：建议修哪些真实质量 warning
- 哪些不要碰，避免大范围噪声改动

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3a-frontend-build-warning-audit.md`

报告必须包含：

- `初始状态`
- `构建结果`
- `warning 总览`
- `warning 分类`
- `高优先级风险`
- `修复优先级`
- `阶段 3B/3C 建议`
- `不建议本阶段处理的项`
- `给主控的验收提示`

## 最终回复主控

完成后回复：

- 报告文件路径
- build 是否成功
- warning 分类摘要
- 推荐下一步是 3B 还是 3C
- 当前 `git status --short --untracked-files=all`
- 确认没有修改代码、没有 commit/push


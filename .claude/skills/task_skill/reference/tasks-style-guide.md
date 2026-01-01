# tasks style guide

写 tasks 的目的是让执行不跑偏。

## MVP version rule
每个任务块必须包含
- Spec version: 01_mvp

并且必须与 specs/index.md 的 Current 一致。
不一致就停止执行，先纠正文档。

## Task naming
推荐
- T1 Create database migration for user table
- T2 Implement POST /api/login handler
- T3 Add unit tests for auth service

避免
- 实现登录
- 完成后端
- 优化代码

## Atomic definition
一个任务必须满足
- 目标单一
- 改动范围小
- 失败可快速回退
- 有明确验证方式

## Required fields per task
每个任务必须包含以下小节
- Spec version
- Scope
- Files to touch
- Implementation notes
- Verification
  - Command
  - Expected result
- Evidence
  - Outputs: `.agent/outputs/text/` 中的产物路径（如报告或日志摘要）
  - Manifest: `.agent/manifests/P[序号]-[Name]-manifest.json` 中登记的条目
  - Logs: `.agent/logs/diagnose/` 中的执行日志文件名

## Files to touch rules
- 明确到文件路径
- 若执行发现需要新增文件
  - 先回到 tasks.md 更新 Files to touch
  - 再开始改代码

## No anticipation rule in tasks
不要在一个任务里安排下一任务的内容。
不要在一个任务里顺便把别的模块也改了。

## Example task block
- [ ] T1 Add config loader
  - Spec version: 01_mvp
  - Scope
    - Add config loader reading env vars
  - Files to touch
    - src/config.ts
    - src/config.test.ts
  - Implementation notes
    - Keep default values minimal
    - Validate required fields
  - Verification
    - Command: npm test
    - Expected result: config tests pass
  - Evidence
    - Command: npm test
    - Output: PASS src/config.test.ts
    - Outputs: .agent/outputs/text/T1-config-loader-20251223-1540.txt
    - Manifest: .agent/manifests/P01-Init-manifest.json
    - Logs: .agent/logs/diagnose/verify-2025-12-23.log

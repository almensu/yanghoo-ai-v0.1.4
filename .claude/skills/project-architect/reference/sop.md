# 标准作业程序（SOP - Structured）

## Phase 1 初始化
- 输入：用户目标、既有仓库结构
- 动作：建立 `.agent/`；生成 `.agent/governance.md`；创建 `.agent/specs/index.md`
- 产出：索引与治理文件
- 链接：`reference/governance.md`、`reference/specs-index.md`

## Phase 2 规划与定界
- 输入：索引 Roadmap、需求变更
- 动作：在 `.agent/specs/<nn_mvp>/` 生成 `prd.md`，明确 In/Out-Scope 与 Acceptance
- 产出：PRD 包；索引更新（Next → Current 待批准）
- 链接：`reference/mvp.md`、`reference/specs-index.md`、`reference/change-control.md`

## Phase 3 路径拆解
- 输入：批准的 PRD
- 动作：生成 `tasks.md`、`requirements.md`、`design.md`；更新 `active_context.md`
- 产出：完整 Spec 包
- 链接：`reference/task.md`、`/.claude/skills/task_skill/reference/tasks-style-guide.md`、`/.claude/skills/task_skill/reference/task-executor.md`

## Phase 4 施工与循环
- 输入：Spec 包与 `active_context.md`
- 动作：选择编排层级并启动服务；运行对应层级测试；记录证据与清单；更新任务勾选
- 产出：测试产物（`.agent/outputs/tests/`）、日志（`.agent/logs/`）、清单（`.agent/manifests/`）
- 链接：`reference/port-management-integration.md`、`reference/hooks.md`、`/.claude/skills/testing-code/SKILL.md`、`reference/verification-gate.md`、`/.claude/skills/task_skill/reference/verification-playbook.md`、`/.claude/skills/task_skill/scripts/validate_tasks.py`

## Phase 5 最终验收
- 输入：完成的任务与测试证据
- 动作：运行 `verify_gate.sh`、人工验收与留痕；必要时回滚与回归
- 产出：通过结论与索引归档
- 链接：`reference/verification-gate.md`、`reference/rollback-and-regression.md`

## 资产与安全
- 严格 `.agent/` 前缀；拒绝路径穿越；仅允许 `.agent/outputs/` 等目录
- 链接：`reference/asset-storage-constraints.md`、`reference/security-compliance.md`、`reference/logging-routing.md`

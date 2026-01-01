# P[XX]: Execution Tasks
> Status: 🚧 In Progress

## Phase 1: Design & Spec
- [ ] 生成 `.agent/specs/P[XX]-Spec.md`
- [ ] 定义 TypeScript 接口/类型

## Phase 2: Core Logic
- [ ] 实现 Service 层逻辑
- [ ] 编写单元测试 (Test First)

## Phase 3: Integration & Verify
- [ ] 实现 API/UI 层
- [ ] 运行 `verify_gate.sh` 进行机器验收
- [ ] 等待人工验收 (Human Review)

## 脚本联动（task_skill）
- 任务风格：`/.claude/skills/task_skill/reference/tasks-style-guide.md`
- 任务执行器：`/.claude/skills/task_skill/reference/task-executor.md`
- 任务校验：`/.claude/skills/task_skill/reference/verification-playbook.md`
- 任务验证脚本：`/.claude/skills/task_skill/scripts/validate_tasks.py`

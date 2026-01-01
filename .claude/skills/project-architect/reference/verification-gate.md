# 验收闸门（Verification Gate）

- 检查项：静态检查（Lint/类型）、单元测试（`npm test` 必须通过）、构建检查（`npm run build` 可选）
- 通过标准：机器自检 0 错误；人工验收结论“通过”并留痕
- 失败处理：修复后重试；闸门失败禁止推进
 - 任务验证：`/.claude/skills/task_skill/scripts/validate_tasks.py` 与 `/.claude/skills/task_skill/reference/verification-playbook.md`

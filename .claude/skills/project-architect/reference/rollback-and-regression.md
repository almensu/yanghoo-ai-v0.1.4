# 回滚与回归（Rollback & Regression）

## 触发条件
- 验收失败或关键检查未通过（`verify_gate.sh`/安全/合规）

## 流程
- 回滚：恢复到上一个稳定版本；更新索引与清单备注
- 回归：针对失败点设计测试用例，纳入回归目录与 CI
- 再验收：修复后重跑测试与闸门，自检通过后人工复验
 - 校验手册：`/.claude/skills/task_skill/reference/verification-playbook.md`

## 记录
- 清单与日志：记录回滚原因、影响范围与再验收结论

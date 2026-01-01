# Specs 索引结构（.agent/specs/index.md）

## 字段建议
- `Current`: 当前执行版本（如 `01_mvp`）
- `Next`: 下一版本候选（如 `02_mvp`）
- `Acceptance`: 验收口径（步骤/证据/通过阈值）
  - 参考：`/.claude/skills/task_skill/reference/verification-playbook.md`
- `Cutline`: In-Scope / Out-of-Scope 的明确边界
- `Roadmap`: 未来版本简述（列表）

## 维护规则
- 以索引为唯一事实来源；批准后将 `Current` 指向新包
- 每次更新记录时间与作者（Comments 留痕）
- 与 PRD 包一致性检查（索引与包的范围与口径一致）

# 变更治理与漂移信号（Change Control）

## 漂移信号
- 参考：`/.claude/skills/task_skill/reference/drift-signals.md`
- 类型：范围漂移、需求不一致、不可验证切片、依赖变更未登记

## 治理流程
- 识别 → 评估影响 → 更新 PRD/索引 → 重新批准 → 才能进入拆解与施工
- 所有变更需在 `.agent/specs/index.md` 记录 Cutline 与 Acceptance 更新
 - 校验手册：`/.claude/skills/task_skill/reference/verification-playbook.md`

## 证据登记
- 更新清单：`.agent/manifests/P[序号]-[功能名]-manifest.json`
- 记录输入与输出、哈希与时间

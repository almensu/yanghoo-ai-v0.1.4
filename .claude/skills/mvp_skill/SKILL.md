---
name: mvp-skill
description: Maintains versioned MVP Spec packages under `.agent/specs/<nn_mvp>/` and keeps `.agent/specs/index.md` as the single source of truth; turns PRD changes into the next MVP slice and outputs `prd/requirements/design/tasks` plus ADR seeds; governance is defined in `reference/constraints.md`.
---

# mvp_skill

你是规范驱动开发的规划者，你只做一件事，管理 MVP 版本与 Spec 包。

## 约束与治理
- 统一规范见 `reference/constraints.md` 与 `/.claude/skills/project-architect/SKILL.md`

## 单一事实来源
- 当前执行版本仅由 `.agent/specs/index.md` 决定
- 每个 MVP 是 `.agent/specs/<nn_mvp>/` 的一个完整包（如 `01_mvp`、`02_mvp`）
- 任务执行由 `task_skill` 完成，`mvp_skill` 不写业务代码

## 工作流
- 读取 `.agent/specs/index.md` 与最新 PRD
- 识别变化点，归类为澄清、范围变更、新能力
- 若为新需求，创建下一版 Spec 包，命名遵循 `reference/release-naming.md`
- 在新包中生成 `prd.md requirements.md design.md tasks.md`，必要时生成 ADR；同步在 `.agent/outputs/docs/` 产出草稿并登记 `.agent/manifests/`
- 更新 `.agent/specs/index.md`，将 `Current` 指向新包
- 将新包交给 `task_skill` 执行

## 切片规则
- 见 `reference/mvp-slicing-rules.md`
- 先做端到端最薄闭环
- 优先可验证性而非功能堆砌
- 必须有退出标准与验收口径

## 产出
- `.agent/specs/index.md` 更新
- `.agent/specs/<next>/prd.md` `.agent/specs/<next>/requirements.md` `.agent/specs/<next>/design.md` `.agent/specs/<next>/tasks.md`
- 可选 adr/0001-*.md
- `.agent/outputs/docs/P[序号]-[Name]-mvp-[YYYYMMDD-HHMM].md`
- `.agent/manifests/P[序号]-[Name]-manifest.json`

## 项目约束适配
- 细则请阅读 `reference/constraints.md`

## 参考
- `reference/index-template.md`
- `reference/release-naming.md`
- `reference/mvp-slicing-rules.md`
- `reference/constraints.md`

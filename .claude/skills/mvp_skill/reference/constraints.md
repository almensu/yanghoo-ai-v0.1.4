# 约束与治理（对齐 Project Architect）

## 位置与结构
- 规格索引位置：`.agent/specs/index.md`
- 规格包位置：`.agent/specs/<nn_mvp>/`（如 `01_mvp`、`02_mvp`）

## 资产存储约束
- 仅允许写入：`.agent/` 体系，禁止根目录与 `src/`
- 输出目录：`.agent/outputs/<type>/`（MVP 相关草稿写入 `.agent/outputs/docs/`）
- 命名规范：`P[序号]-[功能名]-[资产类型]-[YYYYMMDD-HHMM].ext`
- 清单登记：`.agent/manifests/P[序号]-[功能名]-manifest.json`，包含 `p_sequence`、`name`、`skill_id`、`created_at`、`inputs`、`outputs`、`hashes`
- 路径安全：拒绝路径穿越（如 `../`），仅允许 `.agent/outputs/` 前缀

## 切线与验收
- 必须明确 In-Scope 与 Out-of-Scope，并在索引中记录 cutline
- 发布前运行 `bash .claude/skills/project-architect/scripts/verify_gate.sh` 完成机器自检
- 自检通过后记录人工验收摘要，并归档产出与清单

## 工作流对齐
- 读取与更新均以 `.agent/specs/index.md` 为唯一事实来源
- 新增需求创建 `.agent/specs/<next>/` 包，并同步在 `.agent/outputs/docs/` 产出草稿、登记清单

## 参考
- `/.claude/skills/project-architect/SKILL.md` 中“资产存储约束”

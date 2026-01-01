# 资产存储约束（Asset Storage Constraints）

- 输出目录：所有技能生成的资产仅可写入 `.agent/outputs/<type>/`
- 禁止写入：严禁向项目根目录与 `src/` 目录写入任何资产
- 命名规范：`P[序号]-[功能名]-[资产类型]-[YYYYMMDD-HHMM].ext`
- 元数据清单：每次生成必须写入 `.agent/manifests/P[序号]-[功能名]-manifest.json`
  - 必含字段：`p_sequence`、`name`、`skill_id`、`created_at`、`inputs`、`outputs`、`hashes`
- 参数约束：脚本需支持 `--out-dir`、`--p-seq`、`--name`，默认安全输出到 `.agent/outputs/`
- 覆盖策略：默认不覆盖已有文件；如需覆盖必须显式传入 `--force`
- 路径安全：拒绝路径穿越（例如 `../`）；仅允许 `.agent/outputs/` 前缀
- 验收闭环：生成后必须执行机器自检并记录人工验收摘要

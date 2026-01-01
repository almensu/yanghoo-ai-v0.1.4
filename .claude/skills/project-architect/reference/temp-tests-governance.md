# 临时测试脚本治理（Temp Tests Governance）

- 目录分层：`.agent/tests/temp/` 与 `.agent/tests/regression/`
- 命名规范：`YYYYMMDD-HHMM-<component>-<scope>-<short-desc>.test.sh`（同分钟多例 `-seq2`）
- 索引清单：`.agent/manifests/tests-index.json`（`created_at`、`component`、`scope`、`entry`、`expected`、`status`、`related_issue_id`）
- 执行策略：临时测试手动执行，日志写入 `.agent/logs/diagnose/`；回归纳入 CI，与 `verify_gate.sh` 分离
- 保留与归档：保留 30 天；修复后迁回回归或归档；更新索引状态
- 安全与合规：拒绝路径穿越；不得写根与 `src/`；统一脱敏
- 验收闭环：复现→修复→验证通过→转回归/归档；记录人工验收结论

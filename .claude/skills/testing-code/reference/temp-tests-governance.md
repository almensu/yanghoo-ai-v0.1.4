# 临时测试治理（对齐 Project Architect VI）

## 目录
- 临时测试：`.agent/tests/temp/`
- 回归测试：`.agent/tests/regression/`

## 命名
- `YYYYMMDD-HHMM-<component>-<scope>-<short-desc>.test.sh`
- 多例：`-seq2`

## 索引
- `.agent/manifests/tests-index.json` 字段建议：
- `created_at`、`component`、`scope`、`entry`、`expected`、`status(temp|regression|archived)`、`related_issue_id`

## 流程
- 复现 → 修复 → 验证通过 → 迁回归/归档；更新索引状态

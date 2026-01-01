# Evidence & Manifests

## 输出与日志
- 输出：`.agent/outputs/tests/`（报告摘要、覆盖率）
- 日志：`.agent/logs/diagnose/`（测试运行日志）

## 清单
- `.agent/manifests/test-run.json` 最小字段示例：
```json
{
  "p_sequence": "P01",
  "name": "Testing Code",
  "skill_id": "testing-code",
  "created_at": "ISO-8601",
  "inputs": ["npm test", "type-check", "build"],
  "outputs": [
    ".agent/outputs/tests/unit-summary-2025-12-23.txt"
  ],
  "hashes": ["sha256:..."]
}
```

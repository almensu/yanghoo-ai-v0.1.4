# Integration Tests

## 启动与依赖
- 依赖服务按需启动（参考 Port Management Skill）
- 数据初始化与清理（fixtures/seeds）

## 命令
- `npm test`（集成测试标签或目录）

## 产物与登记
- 输出摘要：`.agent/outputs/tests/integration-summary-<date>.txt`
- 运行日志：`.agent/logs/diagnose/integration-<date>.log`
- 清单：`.agent/manifests/test-run.json`（追加条目）

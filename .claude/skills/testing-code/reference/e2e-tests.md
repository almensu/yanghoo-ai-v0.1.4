# E2E Tests

## 联动
- 结合 Playwright Skill；遵循启动→等待→执行→验收的顺序

## 顺序
- 启动服务（参考 Port Management Skill）
- 等待端口与健康检查
- 执行 Playwright 测试
- 停止服务并触发 Stop Hook 验收

## 产物与登记
- 输出摘要：`.agent/outputs/tests/e2e-summary-<date>.txt`
- 运行日志：`.agent/logs/diagnose/e2e-<date>.log`
- 清单：`.agent/manifests/test-run.json`（追加条目）

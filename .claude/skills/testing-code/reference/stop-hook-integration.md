# Stop Hook 集成

## 触发位置
- 测试执行后的停止阶段（Stop）触发自动测试与验收

## 日志与产物
- 日志：`.agent/logs/diagnose/stop-<date>.log`
- 产物：`.agent/outputs/tests/`（汇总报告），清单：`.agent/manifests/test-run.json`

## 失败处理
- 记录失败摘要；回到对应层级测试修复后重试；闸门失败禁止推进

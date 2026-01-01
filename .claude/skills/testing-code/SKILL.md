---
name: testing-code
description: Guides unit/integration/e2e testing, evidence capture, verification gate, and stop hook automation; use when asked to run tests, type-check, build verification, coverage, or manage temporary/regression tests.
---

# Testing Code

## 触发信号
- 运行测试/类型检查/构建验证/覆盖率/临时测试/回归测试/CI 校验

## 分级测试最佳实践
- Unit（单元）
  - 快速反馈，纯函数优先，mock 边界
  - 默认命令：`npm test`
- Integration（集成）
  - 真实依赖或近真环境；数据初始化与清理
  - 参考 Port Management Skill 进行端口管理与启动顺序
- E2E（端到端）
  - 联动 Playwright Skill；按 Start→Stop→Stop Hook 验收闭环

## 工作流速查
- 识别变更类别 → 选择测试层级 → 运行 → 收集证据 → 登记清单 → 闸门验证
- 详见 `reference/decision-matrix.md`

## 与项目约束对齐
- 资产与日志：仅写入 `.agent/outputs/`、`.agent/logs/`；清单写 `.agent/manifests/`
- 路径安全：拒绝路径穿越；禁止写入根与 `src/`
- 临时测试治理：目录、命名、保留与迁移、索引字段对齐 Project Architect

## 与 Hooks 联动
- Stop Hook：停止后自动运行测试与验收，详见 `reference/stop-hook-integration.md`
- Start/Stop Hooks：Level 1 结合本地脚本；Level 2/3 走代理/编排命令

## 参考
- `reference/unit-tests.md`
- `reference/integration-tests.md`
- `reference/e2e-tests.md`
- `reference/evidence-and-manifests.md`
- `reference/temp-tests-governance.md`
- `reference/verification-gate.md`
- `reference/stop-hook-integration.md`
- `reference/decision-matrix.md`

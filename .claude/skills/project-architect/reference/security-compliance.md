# 安全与合规（Security & Compliance）

## 检查项
- Secrets 检查：环境变量与配置中不得明文存储密钥（拒绝写根与 `src/`）
- PII 脱敏：日志中掩码身份证号、手机号、邮箱、Token、密钥
- 依赖安全：审计高风险依赖与脚本权限（只写 `.agent/`）

## 时间点
- Phase 4 测试前执行预检查；Phase 5 验收前复核

## 关联
- 日志治理：`reference/logging-routing.md`
- 资产约束：`reference/asset-storage-constraints.md`

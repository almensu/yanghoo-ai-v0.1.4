# CLAUDE.md 指南（给 AI 的项目说明书）

## 作用
- 统一代码风格、技术栈、目录约束、常用命令与错误排查路径
- AI 执行前先阅读本文件与引用的 reference

## 项目概述
- 见 `reference/governance.md`、`reference/specs-index.md`

## 技术栈
- 代理与编排参考 `/.claude/skills/port-management/SKILL.md`、`reference/port-management-integration.md`

## 目录结构与可写约束
- 禁止向 `src/` 与根写入资产；资产仅写 `.agent/`
- 详见 `reference/asset-storage-constraints.md`

## 编码标准
- TypeScript 优先、禁止 `any`（必要时窄化）
- 函数式组件、导入顺序、lint/format 基线

## 常用命令
- 启动/停止：`bash .claude/hooks/start.sh`、`bash .claude/hooks/stop.sh`
- 测试：`npm test`
- 验收：`bash .claude/skills/project-architect/scripts/verify_gate.sh`
- 详见 `reference/hooks.md`、`reference/verification-gate.md`、`/.claude/skills/testing-code/SKILL.md`

## 错误处理 Playbook
- 端口/健康检查 → 日志寻址 → 回滚与回归
- 详见 `reference/logging-routing.md`、`reference/rollback-and-regression.md`

## 测试与证据
- Unit/Integration/E2E 选择与证据/清单最小字段
- 详见 `/.claude/skills/testing-code/SKILL.md`、`/.claude/skills/testing-code/reference/evidence-and-manifests.md`

## 变更治理与 ADR
- 漂移信号与审批，ADR 触发与归档
- 详见 `reference/change-control.md`、`reference/adr-guidelines.md`

## 安全与合规
- Secrets/PII/依赖安全检查项与时间点
- 详见 `reference/security-compliance.md`

## AI 行为准则
- 不写根与 `src/` 资产；仅写 `.agent/`
- 先读 reference 再行动；遵循 SOP 与验收闸门
- 变更需更新索引与清单；失败走回滚与回归

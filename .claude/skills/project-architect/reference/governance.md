# Project Governance
> Stored in .agent/governance.md. DO NOT EDIT src/ WITHOUT CONSULTING THIS.

## A. 目录隔离原则
- `src/`: 仅存放生产代码。
- `.agent/`: 存放所有 Specs, Docs, Memories 与 Assets（outputs/manifests/logs/tmp）。
- 根目录例外：允许存在唯一的 `CLAUDE.md` 作为全局指南，其余说明文档一律入 `.agent/`

## B. 质量红线
- **No Any**: TypeScript 中严禁使用 `any`。
- **Spec-Driven**: 先写接口定义（Spec），再写实现。
- **Asset Governance**: 技能产物统一落于 `.agent/outputs/<type>/`，并登记 `.agent/manifests/`；日志统一落于 `.agent/logs/`
 - **Test Scripts Governance**: 测试脚本仅存放于 `.agent/tests/`；临时测试（`temp/`）与回归测试（`regression/`）分层管理；命名以时间开头并登记 `tests-index.json`；临时测试在修复后转回归或清理。

## C. MVP 交付标准
1. 服务可启动，日志无报错。
2. 自动化测试 (Lint/Unit) 通过。
3. **人工验收通过** (必须等待用户反馈)。

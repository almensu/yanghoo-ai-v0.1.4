# Project Governance
> Stored in .agent/governance.md. DO NOT EDIT src/ WITHOUT CONSULTING THIS.

## A. 目录隔离原则
- `src/`: 仅存放生产代码。
- `.agent/`: 存放所有 Specs, Docs, Memories。严禁在根目录创建 .md 说明文件。

## B. 质量红线
- **No Any**: TypeScript 中严禁使用 `any`。
- **Spec-Driven**: 先写接口定义（Spec），再写实现。

## C. MVP 交付标准
1. 服务可启动，日志无报错。
2. 自动化测试 (Lint/Unit) 通过。
3. **人工验收通过** (必须等待用户反馈)。
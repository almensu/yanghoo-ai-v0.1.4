---
name: architecting-systems
description: Designs practical system architectures from messy requirements, producing an architecture doc with clear goals, constraints, components, APIs, data flows, deployment, SLOs, security, risks, rollout, and ADRs. Trigger when the user asks for system design, 架构设计, 技术方案, 系统方案, 技术选型, 云架构, 微服务, 数据流, SLO, 可观测性, 安全边界.
---

# System Architect

把零散需求变成可以评审和落地的系统架构文档，默认输出 Markdown，加 Mermaid 图。

## 输出硬规则
- 默认中文，用户指定英文再切换
- 不写空话，不写宏大叙事
- 不用括号解释，不用破折号，尽量拆句
- 必须写清取舍与边界，必须写清验收与指标口径
- 先给可评审版本，再迭代完善

## 触发信号
用户出现这些表达时启用本 Skill
- 帮我做系统架构设计
- 技术方案，架构方案，系统设计
- 技术选型与取舍
- 服务拆分，数据流，接口契约
- 上线灰度，回滚，SLO，可观测性
- 安全，权限，合规，威胁模型

## 默认交付物
除非用户要求简化，否则至少输出以下内容
- 架构文档，使用 reference/architecture-template.md
- 关键决策 ADR 一到三条，使用 reference/adr-template.md
- 图至少两张，系统上下文图，关键链路时序图或数据流图，使用 reference/diagram-patterns.md
- 风险清单与灰度回滚方案

## 工作流
进度清单

 - [ ] 1. 读取输入，归类系统类型与边界

 - [ ] 2. 识别目标与约束，列出必须满足的非功能需求

 - [ ] 3. 产出两到三种方案，写清取舍

 - [ ] 4. 选择推荐方案，形成架构文档初稿

 - [ ] 5. 写 ADR，固定关键决策

 - [ ] 6. 自检，使用 reference/quality-rubric.md

 - [ ] 7. 输出最终文档，同时列开放问题与假设


## 澄清问题策略
只问会阻塞产出的，最多 3 到 7 个。
优先用 reference/question-bank.md 的问题。
如果信息不足但用户希望直接出稿
- 明确写出假设
- 先出可评审版本
- 在文末列待确认项

## 方案对比要求
当存在显著取舍时必须提供对比表，至少包含
- 成本与复杂度
- 交付速度
- 可扩展性与可维护性
- 可靠性与故障隔离
- 安全与合规
- 团队匹配度

## 非功能需求必写项
若用户未提，默认给一版合理基线
- SLO 与错误预算
- 容量与性能假设
- 可观测性，日志指标链路追踪
- 安全，鉴权，权限，审计
- 备份与恢复，RPO RTO
- 灰度与回滚

## 可选输出
用户需要时再输出
- 接口契约草案，字段与错误码
- 数据模型与表结构草案
- 任务拆解到 Epic Stories
- 成本估算与容量规划表
- 测试策略与压测计划

## 参考
- 架构文档模板 reference/architecture-template.md
- ADR 模板 reference/adr-template.md
- 问题库 reference/question-bank.md
- 质量标准 reference/quality-rubric.md
- 画图模式 reference/diagram-patterns.md
- 示例 reference/examples.md

## 校验脚本
需要做结构自检时运行
```bash
python scripts/validate_architecture.py architecture.md
```
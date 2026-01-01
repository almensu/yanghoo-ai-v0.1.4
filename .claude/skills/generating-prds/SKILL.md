---
name: generating-prds
description: Generates product requirements documents from messy notes, chats, transcripts, or ideas, producing a clear PRD with goals, scope, requirements, metrics, rollout, and risks. Use when the user asks for PRD, 产品需求文档, feature spec, 功能说明, 需求拆解, user stories, acceptance criteria, 或产品方案落地.
---

# AI PRD Generator

把任何零散输入转成可执行 PRD，面向产品 设计 研发 测试 运营都能直接用。

## 输出风格硬规则
- 语言优先中文，除非用户明确要英文
- 不写空话，不写鸡汤
- 不用括号解释，不用破折号，尽量用逗号或拆句
- 术语统一，始终用 PRD，需求，目标，范围，验收标准
- 默认输出 Markdown

## 触发信号
用户出现这些表达时应启用本 Skill
- 帮我写 PRD
- 需求文档
- 功能方案
- 需求拆解
- 用户故事 验收标准
- 指标埋点 上线计划 风险评估

## 快速开始
按这个流程走，除非用户明确指定别的格式

进度清单
- [ ] 1 收集输入，识别 PRD 类型
- [ ] 2 提炼问题与用户  
- [ ] 4 生成 PRD 初稿，使用 reference/prd-template.md
- [ ] 5 自检，使用 reference/quality-rubric.md
- [ ] 6 输出最终 PRD，同时列出开放问题与假设


## 1 识别 PRD 类型
在回复里先用一句话确认你理解的类型
- 新功能从零到一
- 现有功能迭代优化
- 增长实验 A B
- 平台能力或工具类
- 纯需求拆解与排期

不确定时默认按 现有功能迭代优化 写。

## 2 只问最少的澄清问题
只有在会阻塞产出时才提问，最多 3 到 7 个。
优先从问题库抽题，见 reference/question-bank.md

如果信息不足但用户希望直接出稿
- 明确写出你的假设
- 在 PRD 末尾列出需要确认的问题
- 先给一版可评审文档

## 3 生成 PRD
必须使用模板，见 reference/prd-template.md

生成时遵循
- 每个需求点都给 验收标准
- 关键指标要可度量
- 非目标要写清楚，避免范围蔓延
- 明确依赖与风险
- 给出灰度与回滚

## 4 自检与修订
输出前做一次自检
- 用 reference/quality-rubric.md 的清单逐项检查
- 若用户给了工程约束或时间节点，必须体现在 PRD 里
- 若涉及数据埋点，必须写事件与属性
- 若涉及权限或隐私，必须写边界与审计点

## 5 可选输出
用户需要时再输出，不要默认塞太多
- Jira Epic 与 Stories 列表
- API 草案与字段表
- 埋点方案表格
- 上线公告与 FAQ
- 测试用例大纲

## 参考
- 模板见 reference/prd-template.md
- 问题库见 reference/question-bank.md
- 质量标准见 reference/quality-rubric.md
- 示例见 reference/examples.md

## 开发期校验脚本
需要时运行 scripts/validate_prd.py 对 PRD 做结构校验
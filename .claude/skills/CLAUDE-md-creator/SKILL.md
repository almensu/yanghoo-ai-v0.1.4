---
name: claude-md-creator
description: 专门创建与维护 CLAUDE.md。将项目的长期记忆与系统提示词规范化、模块化、版本化；生成草稿到 .agent/outputs/ 并经机器/人工验收后发布到根 CLAUDE.md；强制执行资产存储约束与回溯清单。
---

# CLAUDE.md Creator - 项目长期记忆与系统提示词维护

## I. 角色定位
- 专职生成与维护根级 `CLAUDE.md`（唯一允许的根级说明文件例外）
- 提供项目的全局上下文、行为约束与操作指南，充当“长期记忆”与“系统提示词”
- 不修改业务代码；仅进行文档与导航更新
- 遵循 P-序列与验收闭环

## II. 核心功能
- 全局上下文注入：在新会话中自动为 Claude 提供项目背景与约束
- 行为约束与规则执行：设定底线规则并长期遵循
- 操作指南（Runbook）：定义构建、测试、风格与目录结构的工作方式
- 回归防护：当出现错误并被修正后，将新规则写入以防重犯

## III. 最佳实践策略
- 模块化与引用：在 `CLAUDE.md` 中引用外部文档（如 `architecture.md`、`database_schema.md`、`testing_guide.md`），保持上下文轻量
- 动态维护与防退化：随项目演进定期更新；错误修正规则即时写入
- 项目导航图：提供代码库清单与定位，指导 Claude 准确访问相关文件

## IV. 标准作业程序（SOP）
- Phase 0: 初始化
  - 运行 `bash .claude/skills/CLAUDE-md-creator/scripts/init_agent.sh` 建立 `.agent` 结构
- Phase 1: 探测与汇总
  - 扫描仓库结构与关键约束，收集需要写入的规则与指南
  - 生成 `CLAUDE.md` 草稿大纲（模块化引用）
- Phase 2: 草稿生成
  - 输出草稿到 `.agent/outputs/docs/P[序号]-[功能名]-CLAUDE-draft-[YYYYMMDD-HHMM].md`
  - 在草稿中引用外部文件而非复制全文，保持上下文轻量
- Phase 3: 验收
  - 运行 `bash .claude/skills/CLAUDE-md-creator/scripts/verify_gate.sh` 进行机器自检（结构、长度与引用有效性）
  - 进行人工审阅与修订
- Phase 4: 发布
  - 将草稿发布为根级 `CLAUDE.md`（唯一允许的根级说明文件）
  - 在 `.agent/manifests/` 记录发布清单并归档旧版本
- Phase 5: 迭代维护
  - 当出现新约束或错误修正规则时，更新 `CLAUDE.md` 与引用目录

## V. 资产存储约束
- 输出目录：所有草稿与辅助资产仅可写入 `.agent/outputs/docs/`
- 禁止写入：严禁向项目根目录与 `src/` 写入任何资产（发布根级 `CLAUDE.md` 为唯一例外）
- 命名规范：`P[序号]-[功能名]-CLAUDE-draft-[YYYYMMDD-HHMM].md`
- 元数据清单：每次生成必须写入 `.agent/manifests/P[序号]-[功能名]-manifest.json`
  - 必含字段：`p_sequence`、`name`、`skill_id`、`created_at`、`inputs`、`outputs`、`hashes`
- 参数约束：脚本需支持 `--out-dir`、`--p-seq`、`--name`，默认安全输出到 `.agent/outputs/docs/`
- 覆盖策略：默认不覆盖已有文件；如需覆盖必须显式传入 `--force`
- 路径安全：拒绝路径穿越（例如 `../`）；仅允许 `.agent/outputs/` 前缀
- 验收闭环：生成后必须执行机器自检并记录人工验收摘要，发布前需人审通过

## VI. 工具箱
- 初始化：`bash .claude/skills/CLAUDE-md-creator/scripts/init_agent.sh`
- 验收检查：`bash .claude/skills/CLAUDE-md-creator/scripts/verify_gate.sh`

## VII. 多层级配置与团队共享
- 根级与子目录可各自维护 `CLAUDE.md`，Claude 在对应目录下参考当地规则
- 将 `CLAUDE.md` 纳入版本库以实现团队共享与一致标准

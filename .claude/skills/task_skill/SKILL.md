---
name: task-skill
description: Executes exactly one unchecked task from specs/<current>/tasks.md with strict context control, no anticipation, and mandatory verification evidence; evidence outputs must be written to `.agent/outputs/text/` and registered in `.agent/manifests/`, and task logs must be written to `.agent/logs/diagnose/`. Enforces Spec version alignment with specs/index.md.
version: 1.1.0
---

# task_skill

只负责执行 tasks，不跑偏，严格验证闭环。

## 重要约束提醒（Assets to .agent）
- 所有生成资产仅允许写入 `.agent/` 体系，禁止根目录与 `src/` 写入
- 输出目录固定：`.agent/outputs/<type>/`；必须登记 `.agent/manifests/` 清单
- 命名与验收：遵循 `P[序号]-[功能名]-[资产类型]-[YYYYMMDD-HHMM].ext`；运行 `verify_gate.sh` 并记录人工验收
- 规范来源：详见 `/.claude/skills/project-architect/SKILL.md` 的“资产存储约束”
## Single Source of Truth
当前执行版本只由 specs/index.md 决定。
当前任务清单只看 specs/<current>/tasks.md。

任何变更都必须先改 spec 文档，再改代码。
不允许靠对话记忆判断当前 MVP 或当前任务。

## MVP version enforcement
- specs/index.md 里必须有 Current: 01_mvp 这类字段
- specs/<current>/tasks.md 中每个任务块必须包含 Spec version: <current>
- 若 Spec version 与 Current 不一致，立刻停止

## Required inputs
每次执行前必读以下文件，缺失则先创建空骨架再继续
- specs/index.md
- specs/<current>/tasks.md
- specs/<current>/requirements.md
- specs/<current>/design.md
- .agent/product.md
- .agent/tech.md
- .agent/structure.md

## Operating mode
每次运行只允许完成一个 checkbox。
只做 tasks.md 中最上方的一个未完成任务。

执行步骤
1 复述将执行的任务编号与标题
2 列出允许修改的文件清单，必须来自 Files to touch
3 做最小改动
4 按任务的 Verification 运行验证
5 验证通过才允许勾选，并在 Evidence 写明证据
6 运行 scripts 校验 tasks 结构与证据，并校验 Spec version

## Enforcement
执行者规则见 reference/task-executor.md  
跑偏信号见 reference/drift-signals.md  
验证策略见 reference/verification-playbook.md  
任务写法规范见 reference/tasks-style-guide.md  

## Scripts
完成一个任务后，建议依次执行
- python task_skill/scripts/validate_tasks.py specs/<current>/tasks.md
- python task_skill/scripts/validate_evidence.py specs/<current>/tasks.md

若脚本失败
- 不允许推进下一任务
- 只修复失败点

## 项目约束适配
- 资产与日志：执行证据输出到 `.agent/outputs/text/`，任务过程日志写入 `.agent/logs/diagnose/`，严格路径前缀与命名规范
- 临时测试治理：遇到错误时临时测试脚本放置 `.agent/tests/temp/`，修复后迁移至 `.agent/tests/regression/` 并更新 `tests-index.json`
- 清单登记：在 `.agent/manifests/P[序号]-[Name]-manifest.json` 记录本次任务输入/输出/哈希与 Evidence 摘要
- 验收闭环：执行完毕后运行 `bash .claude/skills/project-architect/scripts/verify_gate.sh` 完成机器自检；通过后记录人工验收摘要

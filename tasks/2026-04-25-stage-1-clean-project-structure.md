# 阶段 1：项目结构清爽

你是 glm。用户明确要求：主控只负责给你写提示词，不直接执行代码；你负责实际干活。现在进入“阶段 1：项目结构清爽”的实施。

主控验收规则：你完成后，主控不会只相信你的总结。主控必须独立扫描工作区，检查 `git status`、关键目录结构、实际文件移动、README/.gitignore 内容、验证命令结果和遗留风险。因此你的产出必须可复核、可追踪、可对照。

## 背景

父进程此前误执行过一次 `mkdir`，可能已经创建了这些空目录：

- `docs/design`
- `backend/scripts`
- `backend/tests/manual`
- `backend/tests/fixtures`
- `archive/backups/backend/src`
- `archive/backups/backend/src/tasks`
- `archive/backups/frontend/src/components`
- `archive/releases`

请你把这些当作已存在状态处理，不要盲目删除；如果最终方案不用某些空目录，可在提交前清理空目录。

## 目标

做低风险结构整理，让顶层和源码目录更清爽，但不改变业务行为、不重命名核心模块、不改运行入口。

本阶段的“清爽”只定义为：

- 顶层只保留项目入口、依赖、核心说明和一眼能理解的一级目录。
- 备份、副本、临时测试、样例产物不混在源码目录。
- 文档、脚本、手工测试资产各有明确位置。
- README 能解释当前结构，不再指向不存在的文件。
- `.gitignore` 与实际结构一致，不把应跟踪的文档或任务提示词误忽略。

本阶段不追求：

- 拆分 `backend/src/main.py`
- 统一所有后端路径基准
- 修复重复路由
- 重命名拼写错误但已被引用的模块
- 改前端页面架构或路由策略

## 执行原则

1. 你可以修改文件和移动文件，但不要启动服务，不要下载依赖，不要做网络请求。
2. 不要删除 `yanghoo-ai-v0.1.5/` 的外层仓库依赖；当前 `.git` 是 worktree 指针，必须谨慎。若移动/归档其内部残留会破坏 worktree，就不要动。
3. 不要移动或重命名核心源码路径：`backend/src/main.py`、`backend/src/routes/`、`backend/src/tasks/` 下正式任务文件、`frontend/src/App.js`、`frontend/src/pages/TaskListPage.js`、`frontend/src/pages/StudioPage.js`、`frontend/src/components/` 正式组件。
4. 对已被路由引用的 `frontend/src/pages/TestPage_*.js` 暂时不要移动，避免 CRA build 失败；可以只在文档里列为下一阶段。
5. 对 `backend/src/tasks/download_youtueb_vtt.py` 这种拼写问题不要重命名，本阶段只记录风险。
6. 不要处理深层架构问题，比如重复路由、`DATA_DIR` 不一致、`main.py` 拆分；本阶段只做结构卫生。
7. 不要提交 commit。
8. 每一次移动、删除、改内容，都必须能解释“为什么低风险”和“如何验收”。

## 强制执行流程

你必须按下面顺序执行，并在最终报告中逐项对应。

### 0. 建立执行记录

创建 `tasks/reports/2026-04-25-stage-1-clean-project-structure-report.md`，记录你的执行过程和结果。

报告必须包含这些小节：

- `初始状态`
- `执行计划`
- `实际操作日志`
- `文件变更清单`
- `验证结果`
- `未处理风险`
- `给主控的验收提示`

### 1. 初始扫描

开始修改前，先记录以下信息到报告：

- 当前分支或 worktree 状态。
- `git status --short` 的原始输出。
- 顶层目录清单。
- 已跟踪的备份/副本/临时文件清单。
- 你认为本阶段会改动的文件清单。

### 2. 写执行计划

修改前先在报告中写一个简短执行计划，格式为：

```text
Step 1 - 文档归位：预计移动/修改 ...
Step 2 - 后端脚本归位：预计移动/修改 ...
Step 3 - 手工测试资产归位：预计移动/修改 ...
Step 4 - 备份副本归档：预计移动/修改 ...
Step 5 - 本地产物清理：预计删除 ...
Step 6 - 验证：预计运行 ...
```

如果某项你决定不做，必须写明原因。

### 3. 分步实施

实施时每完成一类整理，都把实际结果追加到报告：

- 执行了什么。
- 涉及哪些路径。
- 是否改了引用。
- 为什么不会影响启动或构建。

不要只在最后写笼统总结。

### 4. 最终自检

完成修改后，必须重新扫描：

- `git status --short`
- 顶层目录清单
- `find` 或等价方式确认 `.bak`、`* copy.py`、`.DS_Store`、`__pycache__` 的剩余情况
- 检查 README 是否还引用不存在的 `启动.md`
- 检查 `.gitignore` 是否仍错误忽略需要跟踪的 `docs/` 或 `tasks/`

把这些结果写入报告。

## 建议实施范围

### A. 文档归位

- 建立或使用 `docs/`，把根目录中项目说明类文档归入合适位置，例如 `BLOCK_SYSTEM_DEMO.md`、`PROJECT_SYSTEM_GUIDE.md`。
- 如果 `PROJECT_BUBBLE_DESIGN.md` 是空文件，优先删除或归档为空文件说明，选择更清爽的方案。
- 更新根 `README.md`：标题版本改为 v0.2.0；不要再引用不存在的 `启动.md`；增加清晰的项目结构概览、启动方式、数据目录说明。
- 注意当前 `.gitignore` 有 `docs/`，如果你要跟踪 docs，需要同步调整 `.gitignore`，不要让文档移动后变成无法跟踪。

### B. 后端脚本归位

- 把 `backend/migrate_doc_files.py`、`backend/migrate_metadata.py`、`backend/restore_orphaned_tasks.py` 移入 `backend/scripts/`。
- 如果脚本内部有相对路径假设，请修正为基于脚本位置或项目根的稳定路径；不要改变脚本原有目的。

### C. 手工测试/样例归位

- 处理 `test_raw_srt.py` 与 `backend/test_raw_srt.py` 的重复。优先保留能从新位置运行的一份，放到 `backend/tests/manual/`，删除重复项或归档重复项。
- `backend/test_output.mp4` 放到 `backend/tests/fixtures/` 或归档；若它只是临时产物且无引用，建议归档到 `archive/` 或删除，但删除前确认 git 跟踪状态并说明。
- `frontend/timestamp_test.html`、`frontend/test_timestamp_formats.md` 如果是手工测试资产，放到 `frontend/tests/manual/` 或 `frontend/dev/`，并修正相对引用；如果当前组件依赖 `test_timestamp_formats.md` 默认路径，先不要移动，或者同步修正引用。

### D. 备份/副本归档

- 已跟踪的 `.bak` 和 `* copy.py` 不应继续混在源码目录。归档到 `archive/backups/...`，保留原相对路径信息，避免误删历史对照。
- 归档后确认正式源码没有引用这些文件。

### E. 本地产物清理

- 清理 `.DS_Store`、`__pycache__/` 等本地缓存产物。
- 保持 `backend/data/` 被忽略，不纳入源码。

## 验收要求

你最终回复主控时，必须给出：

1. 报告文件路径：`tasks/reports/2026-04-25-stage-1-clean-project-structure-report.md`
2. 实际修改、移动、删除的文件列表。
3. `git status --short` 的最终结果摘要。
4. 验证命令和结果：
   - Python 至少做语法检查，例如 `python -m py_compile` 或等价方式。
   - 前端如果 `node_modules` 已存在，运行 `npm run build`；如果不存在，不要联网安装，说明未运行原因。
5. 风险留存清单：哪些结构问题本阶段不动、下一阶段处理。
6. 明确说明没有提交 commit。

## 主控验收方式

glm 完成后，主控必须独立执行成果扫描，不能只看 glm 的总结。主控验收至少包括：

1. 读取 `tasks/reports/2026-04-25-stage-1-clean-project-structure-report.md`。
2. 查看 `git status --short`，确认变更范围与报告一致。
3. 扫描顶层目录，确认根目录更清爽且没有新增无意义目录。
4. 扫描备份/副本/缓存残留，确认 `.bak`、`* copy.py`、`.DS_Store`、`__pycache__` 已按计划处理或报告中解释。
5. 检查 README 和 `.gitignore` 是否与新结构匹配。
6. 根据报告中的验证命令，判断是否需要补跑或要求 glm 返工。

若主控发现报告与实际工作区不一致，应要求 glm 先修正报告和遗漏项，再进入下一阶段。

完成后把结果发给主控验收。

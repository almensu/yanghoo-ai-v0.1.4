# 阶段 4B：后端数据深度清理 (Backend Data Cleanup)

你是 glm。基于 4A 审计报告的发现，用户已确认可以“暴力删除”所有孤立任务文件夹及无关调试文件。本阶段的目标是物理删除这些冗余数据，释放空间。

## 目标

1.  **删除孤立 UUID 文件夹**：物理删除 6 个仅含 `info.json` 且未注册的任务目录。
2.  **清理调试产物**：删除 `backend/data/` 目录下的历史调试文本文件。
3.  **整理备份文件**：删除多余备份，将重要迁移备份移至 `archive/backups/`。

## 物理删除清单

### 1. 孤立 UUID 目录 (位置: `backend/data/`)
- `07c8f2c9`
- `16eb98dc`
- `4e22c9ef`
- `713dbbf0`
- `7bf2c48b`
- `e353db3e`

### 2. 调试及多余备份文件 (位置: `backend/data/`)
- `all_dirs.txt`
- `metadata_keys.txt`
- `metadata_archived.json.bak`

### 3. 需移动的备份 (移至: `archive/backups/backend/`)
- `metadata_archived.json`
- `metadata_backup_before_doc_files_migration.json`

## 强制约束

1.  **精确删除**：在执行删除之前，必须再次确认该 UUID 不在 `metadata.json` 中。
2.  **保留核心**：严禁触碰 `metadata.json` 和其他 56 个有效任务目录。
3.  **不执行 commit/push**。

## 执行步骤

### Step 1 - 执行删除
使用 shell 命令或 Python 脚本，按照上述清单逐一删除目录和文件。

### Step 2 - 执行移动
将需要保留的 JSON 备份移动到项目根目录下的 `archive/backups/backend/` 目录。

### Step 3 - 最终验证
运行 `ls -F backend/data/` 确认：
- 剩余文件夹数量应为 56。
- 无关文本文件已消失。
- `metadata.json` 完好无损。

## 报告要求
将执行过程和最终目录状态写入：`tasks/reports/2026-04-25-stage-4b-backend-cleanup-report.md`。

## 最终回复主控
完成后回复：
- 已删除的文件夹和文件总数。
- 最终 `backend/data/` 目录下的文件夹计数。
- 报告路径。

# 阶段 4A 执行报告：后端数据一致性审计

执行日期：2026-04-25
执行者：Claude (glm)

## 统计信息

| 指标 | 数量 |
|------|------|
| metadata.json 记录数 | 56 |
| 磁盘 UUID 文件夹数 | 62 |
| 有效任务（有记录有文件夹） | 56 |
| 有记录无文件夹 | 0 |
| 有文件夹无记录（孤立） | 6 |
| 断链文件引用（以 data/ 为根） | 0 |
| 路径穿越风险 | 0 |
| 无 media_files 的任务 | 32 |

## 孤立任务清单（有文件夹无记录）

均为下载中断的任务，只留下 `info.json`（yt-dlp 元数据），无实际媒体文件：

| # | UUID | 来源 | 标题 | info.json 大小 |
|---|------|------|------|---------------|
| 1 | `07c8f2c9` | xiaoyuzhoufm.com | AEE Episode 2: Interviewing in the United States | 3 KB |
| 2 | `16eb98dc` | YouTube | Martha MacCallum reflects on Fox News' 25th anniversary | 499 KB |
| 3 | `4e22c9ef` | YouTube | 5 Types of Testing Software Every Developer Needs to Know! | 530 KB |
| 4 | `713dbbf0` | YouTube | Martha MacCallum: Trump's 'comecomeback' story is 'extraordinary' | 557 KB |
| 5 | `7bf2c48b` | YouTube | 雷军经典演讲：我如何度过三次人生低谷？ | 135 KB |
| 6 | `e353db3e` | (空/损坏) | info.json 仅 1 字节，JSON 解析失败 | 1 B |

**分析**: 这 6 个文件夹均为下载流程中断的残留。任务在创建目录并写入 `info.json` 后，下载失败或被取消，导致没有进入 metadata.json 注册流程。

## 失效记录清单（有记录无文件夹）

**0 条。** 所有 metadata.json 中的 56 条记录都有对应的磁盘文件夹。

## 断链文件清单

**0 条。** 所有 metadata.json 中引用的文件路径（以 `backend/data/` 为根）均真实存在。

**路径格式说明**: 路径格式为 `UUID/filename.ext`（如 `d6755328.../video_360p.mp4`），以 `data/` 目录为根解析，不是以任务文件夹为根。此格式一致，无问题。

## 无 media_files 的任务

32 个任务没有 `media_files` 字段（为空字典或不存在）。这些任务可能是：
- 仅下载了字幕但未下载视频
- 仅作为文本/笔记任务
- 视频在 YouTube/embed 模式下引用外部链接

这些不影响数据一致性，但说明约 57% 的任务不含本地媒体文件。

## 改进建议

### 1. 清理孤立文件夹（低风险，推荐执行）

6 个孤立文件夹只含 `info.json`，总计约 1.7 MB，可安全删除：
- 5 个含有效 yt-dlp/xiaoyuzhou 元数据的 info.json
- 1 个（`e353db3e`）info.json 损坏（仅 1 字节）

建议写一个清理脚本：删除只有 `info.json` 且不在 metadata.json 中的 UUID 文件夹。

### 2. 添加下载中断自动清理

当前下载流程在失败时不会清理已创建的目录和 `info.json`。建议在下载失败路径中添加 try/finally 清理逻辑。

### 3. 清理 data/ 目录下的非 UUID 文件

| 文件 | 大小 | 说明 | 建议 |
|------|------|------|------|
| `all_dirs.txt` | — | 历史调试产物 | 删除 |
| `metadata_keys.txt` | — | 历史调试产物 | 删除 |
| `metadata_archived.json` | — | 归档备份 | 保留或移到 backups/ |
| `metadata_archived.json.bak` | — | 备份的备份 | 删除 |
| `metadata_backup_before_doc_files_migration.json` | — | 迁移前备份 | 保留或移到 backups/ |

### 4. 添加定期一致性检查

建议将审计脚本固化到 `backend/scripts/` 目录，可手动或定期运行。

## 最终 git status

```
?? tasks/2026-04-25-stage-4a-backend-data-integrity-audit.md
?? tasks/reports/2026-04-25-stage-4a-backend-data-integrity-audit-report.md
```

## 未 commit / 未 push

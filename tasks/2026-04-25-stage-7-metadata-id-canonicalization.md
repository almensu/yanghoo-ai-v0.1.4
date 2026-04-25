# 阶段 7：Metadata ID 规范化与一致性校验

## 背景

当前 `backend/data/metadata.json` 使用两种位置记录任务 ID：

```json
{
  "uuid-as-key": {
    "uuid": "uuid-inside-record",
    "url": "...",
    "platform": "youtube"
  }
}
```

这会带来一致性风险：顶层 key、`TaskMetadata.uuid`、`backend/data/{uuid}/` 目录名如果不一致，API 查询、文件路径和前端展示可能引用不同任务。

## 决策

以 `TaskMetadata.uuid` 的值作为业务上的 canonical task id。`metadata.json` 顶层 key 作为存储索引保留，但必须满足：

```text
metadata key == str(TaskMetadata.uuid)
```

YouTube 的 `video_id`、外部平台 ID 或文件名 ID 不能替代任务 UUID。若未来需要记录，应使用独立字段，例如 `source_id` 或 `youtube_video_id`。

## 执行目标

### Step 1 - 加载时一致性校验

在 `backend/src/main.py` 的 `load_metadata()` 中校验每条记录：

- `uuid_str` 必须等于 `str(task_meta.uuid)`。
- 不一致时记录明确错误日志。
- 不要静默改写生产 metadata。
- 对不一致记录采用安全策略：跳过加载或抛出可诊断错误，具体实现需与现有调用链兼容。

### Step 2 - 保存时规范化

在 `save_metadata()` 中保存前规范化输出：

```python
normalized[str(task.uuid)] = task
```

禁止把外部传入的任意 dict key 原样作为最终 task id。

### Step 3 - 一次性迁移脚本

新增脚本，例如：

```text
backend/scripts/migrate_metadata_uuid_keys.py
```

脚本要求：

1. 先备份 `backend/data/metadata.json` 到 `archive/backups/backend/`。
2. 扫描所有记录，找出 `key != record.uuid` 的项。
3. 若 `backend/data/{key}` 目录存在，通常以目录名/key 作为现实依据，修正内部 `uuid`。
4. 若只有 `backend/data/{record.uuid}` 目录存在，则可改顶层 key。
5. 若两边目录都存在或都不存在，输出人工处理项，不自动合并。
6. 生成迁移报告到 `tasks/reports/`。

### Step 4 - 测试覆盖

增加 focused tests，覆盖：

- 正常 metadata：`key == uuid`。
- 异常 metadata：`key != uuid` 时被检测。
- `save_metadata()` 输出 key 始终等于 `TaskMetadata.uuid`。
- 迁移脚本对 key、record uuid、目录三者冲突的处理分支。

## 验证命令

至少运行：

```bash
python -m py_compile backend/src/main.py backend/src/schemas.py backend/scripts/migrate_metadata_uuid_keys.py
python backend/tests/test_metadata_id_consistency.py
```

若修改影响现有 ingest 或 task API，还需运行相关后端脚本测试。

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-7-metadata-id-canonicalization-report.md
```

报告需包含：

- 最终 canonical ID 决策。
- 发现了多少条不一致 metadata。
- 自动修复了哪些项。
- 哪些项需要人工处理。
- 执行过的验证命令和结果。

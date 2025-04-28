# 处理进度跟踪功能指南

本文档介绍了媒体处理进度跟踪系统的工作原理、实现方式及使用方法。

## 功能概述

进度跟踪系统为以下处理任务提供实时反馈：

- 视频下载
- 音频提取
- WhisperX 转录
- Ollama 翻译

通过详细的百分比进度和状态信息，用户可以清楚地了解当前处理到了哪个阶段。

## 系统组件

进度跟踪系统由以下组件组成：

1. **数据库字段** - Resource模型中的进度跟踪字段
   - `progress_status` - 当前状态描述
   - `progress_percent` - 进度百分比 (0-100)
   - `progress_updated_at` - 最后更新时间

2. **后端进度服务** - 封装的进度更新功能
   - `update_progress()` - 进度更新函数
   - 预定义的进度映射对象

3. **API端点** - 用于查询进度信息
   - `GET /api/resources/{id}/progress`

4. **前端组件** - 用于显示进度
   - `ProcessingProgress.jsx` - 可重用的进度显示组件

## 使用方法

### 执行数据库迁移

首次使用前，需要运行迁移脚本添加必要的数据库字段：

```bash
cd backend/scripts
python3 migrate_progress_fields.py
```

### 前端集成

ProcessingProgress组件可以在任何页面中使用：

```jsx
import ProcessingProgress from '../components/ProcessingProgress';

// 在组件中使用
<ProcessingProgress 
  resourceId={123}  // 资源ID
  autoRefresh={true}  // 自动刷新
  interval={2000}  // 刷新间隔（毫秒）
  onComplete={(data) => console.log('处理完成', data)}  // 完成回调
/>
```

### 配置进度阶段

不同处理任务的进度阶段在 `progress_service.py` 中预定义：

```python
DOWNLOAD_PROGRESS_MAP = {
    "started": 5,
    "downloading": 30,
    "processing": 70,
    "finalizing": 90,
    "completed": 100
}
```

可以根据需要调整这些阶段值。

## 开发指南

### 为新处理函数添加进度跟踪

1. 导入所需的模块和映射：

```python
from .progress_service import update_progress, TRANSCRIPTION_PROGRESS_MAP
```

2. 在处理函数中的关键点更新进度：

```python
# 初始化
update_progress(db, resource_id, "开始处理", TRANSCRIPTION_PROGRESS_MAP["started"])

# 处理中
update_progress(db, resource_id, "处理数据", TRANSCRIPTION_PROGRESS_MAP["processing"])

# 完成
update_progress(db, resource_id, "处理完成", TRANSCRIPTION_PROGRESS_MAP["completed"])

# 错误处理
update_progress(db, resource_id, f"处理错误: {str(e)}", 0)
```

3. 确保在每个关键步骤都有明确的进度更新，以提供准确的反馈。

## 注意事项

- 进度更新应该足够频繁以提供有用的反馈，但不要过度更新导致性能问题
- 避免硬编码百分比，应使用预定义的进度映射
- 错误状态也应通过进度系统反馈，百分比设为0表示处理失败
- 前端轮询间隔默认为2秒，可根据需要调整 
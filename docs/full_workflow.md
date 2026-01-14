# 音频转写翻译完整工作流程

本文档详细介绍了从音频文件到多语言转写的完整流程，包括前端界面操作和后端处理过程。

## 工作流程概述

完整的处理流程包括以下步骤：

1. **获取媒体**：上传或下载视频/音频文件
2. **音频提取**：从视频中提取 WAV 格式音频
3. **WhisperX 转写**：将音频文件转录为带时间戳的 JSON 格式文本
4. **Ollama 翻译**：使用本地 Ollama 将英文转录翻译成中文
5. **查看/导出**：查看或导出转写和翻译结果

## 1. 系统需求与准备

### 1.1 安装必要组件

确保系统中已安装以下组件：

- **后端**：
  - Python 3.8+
  - Flask 和相关依赖
  - SQLite 数据库
  - WhisperX
  - Ollama 及所需模型

- **前端**：
  - Node.js
  - React
  - Tailwind CSS / DaisyUI

### 1.2 配置 Ollama

1. 从 [Ollama 官网](https://ollama.ai/) 下载并安装 Ollama
2. 拉取中文翻译效果较好的模型：

```bash
# 拉取通义千问模型（推荐用于中英文翻译）
ollama pull qwen2:7b  # 或 qwen2.5:7b

# 确保 Ollama 服务在后台运行
ollama serve
```

## 2. 使用前端界面处理媒体

### 2.1 添加新资源

1. 在应用首页点击"添加资源"按钮
2. 输入视频 URL 或上传本地文件
3. 提交后，系统会创建新的资源记录

### 2.2 下载媒体

对于远程 URL 资源：

1. 在资源列表页找到相应资源
2. 点击"下载"按钮，系统会在后台下载媒体文件
3. 下载完成后，资源状态会更新（`is_downloaded` = true）

### 2.3 提取 WAV 音频

1. 下载完成后，点击"提取 WAV"按钮
2. 系统会使用 ffmpeg 从媒体文件中提取 WAV 格式音频
3. 提取完成后，资源状态会更新（`is_wav` = true）

### 2.4 转写音频

1. WAV 提取完成后，点击"转写"按钮（带有 JSON 图标）
2. 系统会使用 WhisperX 处理音频文件，生成带有时间戳的 JSON 转写
3. 转写完成后，资源状态会更新（`is_json` = true）

### 2.5 翻译 JSON

1. 转写完成后，点击"翻译(Qwen)"按钮
2. 系统会使用 Ollama 的 Qwen2.5 模型将英文转写翻译为中文
3. 翻译完成后，资源状态会更新（`is_transcript_cn` = true）

![处理流程界面](../images/workflow_ui.png)

## 3. 后端处理流程详解

### 3.1 WhisperX 转写过程

当用户点击"转写"按钮时，后端会：

1. 启动 WhisperX 处理 WAV 文件
2. 生成 JSON 格式的转写结果，包含：
   - 文本段落
   - 开始/结束时间戳
   - 单词级别时间对齐

JSON 输出示例：
```json
{
    "segments": [
        {
            "start": 0.232,
            "end": 6.491,
            "text": "This is the transcribed text",
            "words": [
                {"word": "This", "start": 0.232, "end": 0.372},
                {"word": "is", "start": 0.392, "end": 0.453},
                // 更多单词...
            ]
        }
    ]
}
```

### 3.2 Ollama 翻译过程

当用户点击"翻译"按钮时，后端会：

1. 调用 `translate_with_ollama.py` 脚本
2. 脚本连接本地 Ollama 服务
3. 使用 Qwen2.5:7b 模型翻译 JSON 中的文本
4. 保存翻译结果，格式与原 JSON 相同，但：
   - 将原始英文文本保存在 `original_text` 字段
   - 将中文翻译放在 `text` 字段

翻译后的 JSON 示例：
```json
{
    "segments": [
        {
            "start": 0.232,
            "end": 6.491,
            "text": "这是翻译后的文本",
            "original_text": "This is the transcribed text",
            "words": [
                {"word": "This", "start": 0.232, "end": 0.372},
                {"word": "is", "start": 0.392, "end": 0.453},
                // 更多单词...
            ]
        }
    ]
}
```

### 3.3 长视频处理

对于长视频（>30分钟），建议：

1. 将视频分割成较小的片段
2. 分别处理每个片段
3. 使用 `merge_translated_json.py` 脚本合并结果：

```bash
cd backend/scripts
python3 merge_translated_json.py part1.json part2.json part3.json -o merged.json
```

## 4. 文件输出与存储

### 4.1 文件存储结构

处理过程中生成的文件存储在以下位置：

- 原始媒体：`backend/data/videos/<hash_id>/`
- WAV 音频：`backend/data/wav/<hash_id>/`
- JSON 转写：`backend/data/json/<hash_id>/transcript.json`
- 翻译 JSON：`backend/data/json/<hash_id>/transcript_cn.json`
- 转写文本：`backend/data/transcript/<hash_id>/<hash_id>_cn.txt`

### 4.2 查看结果

1. 在资源详情页面可以查看：
   - 原始视频/音频
   - 转写文本（英文和中文）
   - 时间戳信息

2. 可以下载以下文件：
   - 原始媒体
   - WAV 音频
   - JSON 转写（英文或中文）
   - 纯文本转写

## 5. 状态跟踪

系统使用数据库字段跟踪每个资源的处理状态：

| 字段 | 说明 |
|------|------|
| `is_downloaded` | 媒体文件是否已下载 |
| `is_wav` | 是否已提取 WAV 音频 |
| `is_json` | 是否已完成 WhisperX 转写 |
| `is_transcript_cn` | 是否已完成中文翻译 |
| `has_transcript_text` | 是否有英文纯文本转写 |
| `has_transcript_cn_text` | 是否有中文纯文本转写 |

## 6. 高级功能与提示

### 6.1 批量处理

如需批量处理多个文件，建议：

1. 使用资源列表页面的批量操作功能
2. 或使用后端脚本直接处理：
   ```bash
   # 批量翻译
   cd backend/scripts
   python3 batch_translate.py /path/to/json_dir -o /path/to/output_dir -m qwen2:7b
   ```

### 6.2 调整翻译质量

可以通过以下方式提高翻译质量：

1. 使用更大的模型：
   ```bash
   ollama pull qwen2:72b  # 更大、更准确，但需要更多内存
   ```

2. 修改 `translate_with_ollama.py` 中的提示词：
   ```python
   prompt = f"Translate the following English text to Chinese with high accuracy..."
   ```

### 6.3 故障排除

常见问题及解决方案：

1. **WhisperX 转写失败**：
   - 检查 WAV 文件是否正确提取
   - 尝试使用更大的 WhisperX 模型

2. **翻译失败**：
   - 确保 Ollama 服务正在运行 (`ollama serve`)
   - 检查模型是否已正确安装 (`ollama list`)
   - 查看后端日志了解详细错误

3. **界面按钮不显示**：
   - 刷新页面
   - 检查资源状态是否正确更新

## 7. API参考

### 7.1 资源处理API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/resources` | GET | 获取资源列表 |
| `/api/resources/<id>` | GET | 获取单个资源详情 |
| `/api/resources/<id>/download` | POST | 下载媒体文件 |
| `/api/resources/<id>/extract-wav` | POST | 提取WAV音频 |
| `/api/resources/<id>/transcribe-audio` | POST | 使用WhisperX转写 |
| `/api/resources/<id>/translate-json` | POST | 翻译JSON到中文 | 
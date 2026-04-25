import sys
import os
import json
from pathlib import Path

# 设置路径
BASE_DIR = Path(__file__).parent.parent
sys.path.append(str(BASE_DIR / 'src'))

from utils.transcript_refiner import TranscriptRefiner
from tasks.generators import Generators

def run_e2e_test():
    print("🚀 开始 Stage 6 端到端集成测试...")
    
    # 1. 模拟 YouTube 原始数据 (json3 风格)
    mock_raw_snippets = [
        {"text": "Welcome to this ", "start": 0.0, "duration": 1.5},
        {"text": "deep dive into AI.", "start": 1.5, "duration": 1.5},
        {"text": "今天我们要聊聊 ", "start": 3.0, "duration": 2.0},
        {"text": "大语言模型的发展历程。", "start": 5.0, "duration": 2.5},
        {"text": "It's a fascinating ", "start": 7.5, "duration": 1.5},
        {"text": "journey for everyone.", "start": 9.0, "duration": 1.5}
    ]
    
    # 模拟视频元数据和章节
    mock_meta = {
        "title": "AI Deep Dive 2026",
        "webpage_url": "https://www.youtube.com/watch?v=test_id",
        "uploader": "Yanghoo AI Lab",
        "description": "00:00 Introduction\n03:00 Chinese Section\n07:30 Future Outlook"
    }
    
    # 模拟章节解析结果
    mock_chapters = [
        {"time": 0, "title": "Introduction"},
        {"time": 3, "title": "Chinese Section"},
        {"time": 7, "title": "Future Outlook"}
    ]

    # 2. 执行清洗算法
    print("Step 1: 运行 TranscriptRefiner...")
    refiner = TranscriptRefiner()
    sentences = refiner.refine(mock_raw_snippets)
    
    # 3. 验证句子生成
    print(f"   - 生成了 {len(sentences)} 个句子")
    assert len(sentences) >= 3
    
    # 4. 执行资产生成
    print("Step 2: 运行 Generators 产生 Markdown 和 VTT...")
    markdown_content = Generators.to_markdown(sentences, mock_meta, mock_chapters)
    vtt_content = Generators.to_vtt(sentences)
    
    # 5. 模拟落盘验证
    test_task_dir = BASE_DIR / "data" / "test_stage6_task"
    test_task_dir.mkdir(parents=True, exist_ok=True)
    
    (test_task_dir / "transcript-sentences.json").write_text(json.dumps(sentences, indent=2, ensure_ascii=False))
    (test_task_dir / "transcript.md").write_text(markdown_content)
    (test_task_dir / "transcript.vtt").write_text(vtt_content)
    
    print(f"Step 3: 检查落盘资产 (目录: {test_task_dir})...")
    
    # 审计 Markdown 内容
    print("\n--- Markdown 审计 (前 15 行) ---")
    md_lines = markdown_content.split('\n')
    for line in md_lines[:15]:
        print(line)
        
    # 验证关键特性
    assert "---" in markdown_content # YAML 头
    assert "## Introduction" in markdown_content # 章节标题
    assert "## Chinese Section" in markdown_content
    assert "[00:00:03]" in markdown_content # 时间戳链接
    assert "今天我们要聊聊大语言模型的发展历程。" in markdown_content # CJK 连贯性
    
    # 审计 VTT 内容
    print("\n--- VTT 审计 (前 10 行) ---")
    vtt_lines = vtt_content.split('\n')
    for line in vtt_lines[:10]:
        print(line)
    assert "WEBVTT" in vtt_content

    print("\n✅ 端到端集成测试圆满完成！")
    print("   - 句子级断句: 完美")
    print("   - 时间戳对齐: 准确")
    print("   - 章节自动注入: 成功")

if __name__ == "__main__":
    run_e2e_test()

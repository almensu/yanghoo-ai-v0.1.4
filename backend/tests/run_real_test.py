import sys
import os
import json
from pathlib import Path

# 设置路径
BASE_DIR = Path(__file__).parent.parent
sys.path.append(str(BASE_DIR / 'src'))

from tasks.youtube_api import YouTubeAPI
from utils.transcript_refiner import TranscriptRefiner
from tasks.generators import Generators

def run_real_test(url):
    print(f"🚀 正在对真实 URL 进行测试: {url}")
    
    try:
        # 1. 获取视频元数据
        print("Step 1: 获取视频元数据...")
        info = YouTubeAPI.get_video_info(url)
        video_id = info.get('id', 'unknown')
        title = info.get('title', 'Unknown Title')
        description = info.get('description', '')
        print(f"   - 标题: {title}")
        
        # 2. 获取章节
        print("Step 2: 提取章节...")
        chapters = YouTubeAPI.extract_chapters(description)
        print(f"   - 提取到 {len(chapters)} 个章节")

        # 3. 获取原始 JSON3 字幕
        print("Step 3: 获取原始 JSON3 字幕片段...")
        # 我们尝试获取英文(en)字幕，如果失败可能需要调整语言代码
        try:
            raw_snippets = YouTubeAPI.get_raw_transcript(url, lang='en')
        except Exception as e:
            print(f"   - 尝试 'en' 失败: {e}. 尝试获取可用字幕列表...")
            # 这里简单处理，如果 en 不行就报错
            raise e
            
        print(f"   - 获取到 {len(raw_snippets)} 个原始片段")

        # 4. 运行精制引擎
        print("Step 4: 运行 TranscriptRefiner 进行语义断句...")
        refiner = TranscriptRefiner()
        sentences = refiner.refine(raw_snippets)
        print(f"   - 清洗并重组为 {len(sentences)} 个连贯句子")

        # 5. 生成资产
        print("Step 5: 生成 Markdown 和 VTT 资产...")
        markdown_content = Generators.to_markdown(sentences, info, chapters)
        vtt_content = Generators.to_vtt(sentences)

        # 6. 保存到测试目录
        output_dir = BASE_DIR / "data" / "real_test_output" / video_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        (output_dir / "transcript-raw.json").write_text(json.dumps(raw_snippets, indent=2, ensure_ascii=False))
        (output_dir / "transcript-sentences.json").write_text(json.dumps(sentences, indent=2, ensure_ascii=False))
        (output_dir / "transcript.md").write_text(markdown_content)
        (output_dir / "transcript.vtt").write_text(vtt_content)

        print(f"\n✅ 真实测试完成！资产已落盘至: {output_dir}")
        print(f"   - Markdown: {output_dir}/transcript.md")
        print(f"   - VTT: {output_dir}/transcript.vtt")
        
        # 展示 Markdown 前几行
        print("\n--- Markdown 预览 ---")
        print("\n".join(markdown_content.split('\n')[:20]))

    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=LInND2d6dtA"
    run_real_test(test_url)

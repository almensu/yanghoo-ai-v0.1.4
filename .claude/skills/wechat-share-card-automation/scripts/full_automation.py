#!/usr/bin/env python3
"""
完整的自动化脚本 - 一键启动服务并生成卡片
集成服务启动、内容填充、自动下载的完整流程
"""

import os
import sys
import time
import json
import argparse
from pathlib import Path

# 添加脚本目录到 Python 路径
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir))

from start_service import start_server, find_available_port, stop_server
from automate_generation import WeChatCardGenerator

class FullAutomation:
    def __init__(self):
        self.server_process = None
        self.generator = None
        self.port = None

    def parse_input(self, input_text):
        """解析用户输入的内容"""
        # 简单解析用户输入
        if "内容" in input_text:
            # 尝试解析结构化输入
            result = {
                "content": "",
                "author": "Yanghoo205",
                "description": "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己"
            }

            # 提取内容
            if '内容"' in input_text:
                content_start = input_text.find('内容"') + 3
                content_end = input_text.find('"', content_start)
                if content_end > content_start:
                    result["content"] = input_text[content_start:content_end]
            elif "内容" in input_text and '"' in input_text:
                # 尝试找到第一个引号对
                first_quote = input_text.find('"')
                second_quote = input_text.find('"', first_quote + 1)
                if second_quote > first_quote:
                    result["content"] = input_text[first_quote+1:second_quote]

            # 提取作者
            if '作者"' in input_text:
                author_start = input_text.find('作者"') + 3
                author_end = input_text.find('"', author_start)
                if author_end > author_start:
                    result["author"] = input_text[author_start:author_end]

            # 提取描述
            if '描述"' in input_text:
                desc_start = input_text.find('描述"') + 3
                desc_end = input_text.find('"', desc_start)
                if desc_end > desc_start:
                    result["description"] = input_text[desc_start:desc_end]

            return result
        else:
            # 简单情况，整个输入作为内容
            return {
                "content": input_text,
                "author": "Yanghoo205",
                "description": "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己"
            }

    def start_service(self):
        """启动服务"""
        try:
            print("🚀 启动微信分享卡片服务...")
            self.port = find_available_port()
            self.server_process, self.port = start_server(self.port)
            print(f"✅ 服务已启动: http://localhost:{self.port}")
            return True
        except Exception as e:
            print(f"❌ 服务启动失败: {e}")
            return False

    def generate_card(self, content, author, description):
        """生成卡片"""
        try:
            print("🎨 初始化卡片生成器...")
            self.generator = WeChatCardGenerator(self.port)

            if not self.generator.setup_driver():
                return False

            print(f"📝 生成卡片，内容长度: {len(content)} 字符")
            if self.generator.generate_card(content, author, description):
                # 查找下载文件
                latest_file = self.generator.find_latest_download()
                if latest_file:
                    print(f"📁 卡片已保存到: {latest_file}")
                    return latest_file
                else:
                    print("⚠️  未找到下载文件")
                    return False
            else:
                return False

        except Exception as e:
            print(f"❌ 卡片生成失败: {e}")
            return False

    def cleanup(self):
        """清理资源"""
        print("🧹 清理资源...")
        if self.generator:
            self.generator.cleanup()
        if self.server_process:
            stop_server(self.server_process)
        print("✅ 清理完成")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="微信分享卡片自动生成器")
    parser.add_argument("content", help="卡片内容或完整输入")
    parser.add_argument("--author", help="作者名称", default="Yanghoo205")
    parser.add_argument("--description", help="作者描述")
    parser.add_argument("--json", help="JSON 格式输入")

    args = parser.parse_args()

    automation = FullAutomation()

    try:
        # 解析输入
        if args.json:
            data = json.loads(args.json)
            content = data.get("content", "")
            author = data.get("author", args.author)
            description = data.get("description", args.description)
        else:
            parsed = automation.parse_input(args.content)
            content = parsed["content"]
            author = parsed.get("author", args.author)
            description = parsed.get("description", args.description)

        if not content:
            print("❌ 错误: 未提供有效内容")
            sys.exit(1)

        print(f"📋 内容预览: {content[:50]}...")

        # 启动服务
        if not automation.start_service():
            sys.exit(1)

        # 生成卡片
        result = automation.generate_card(content, author, description)

        if result:
            print(f"🎉 成功！卡片文件: {result}")
        else:
            print("❌ 卡片生成失败")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n⏹️  用户中断操作")
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        sys.exit(1)
    finally:
        automation.cleanup()

if __name__ == "__main__":
    main()
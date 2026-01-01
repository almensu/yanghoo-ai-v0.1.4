#!/usr/bin/env python3
"""
微信分享卡片自动化生成脚本
使用 Selenium 自动化浏览器操作，实现内容填充和自动下载
"""

import os
import sys
import time
import json
import urllib.request
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class WeChatCardGenerator:
    def __init__(self, port=8000):
        self.port = port
        self.base_url = f"http://localhost:{port}"
        self.driver = None

    def setup_driver(self):
        """设置浏览器驱动"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # 无头模式
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1200,800")

        # 设置默认下载目录
        downloads_dir = str(Path.home() / "Downloads")
        prefs = {
            "download.default_directory": downloads_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            return True
        except Exception as e:
            print(f"❌ 浏览器启动失败: {e}")
            return False

    def wait_for_server(self, max_retries=10):
        """等待服务器启动"""
        for i in range(max_retries):
            try:
                urllib.request.urlopen(f"{self.base_url}/local-images.html", timeout=2)
                return True
            except:
                time.sleep(1)
        return False

    def generate_card(self, content, author="Yanghoo205", description=None):
        """生成卡片"""
        try:
            # 等待服务器就绪
            print("🔄 等待服务器启动...")
            if not self.wait_for_server():
                raise RuntimeError("服务器启动超时")

            print("🌐 打开网页...")
            self.driver.get(f"{self.base_url}/local-images.html")

            # 等待页面加载
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.ID, "context")))

            print("📝 填充内容...")
            # 填充内容
            context_field = self.driver.find_element(By.ID, "context")
            context_field.clear()
            context_field.send_keys(content)

            # 填充作者
            author_field = self.driver.find_element(By.ID, "author")
            author_field.clear()
            author_field.send_keys(author)

            # 填充描述
            if description:
                desc_field = self.driver.find_element(By.ID, "description")
                desc_field.clear()
                desc_field.send_keys(description)

            print("🎨 生成卡片...")
            # 点击下载按钮
            download_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), '下载卡片图片')]")
            download_btn.click()

            # 等待下载完成
            time.sleep(3)

            print("✅ 卡片生成完成")
            return True

        except Exception as e:
            print(f"❌ 生成失败: {e}")
            return False

    def find_latest_download(self, pattern="card-*.png"):
        """查找最新的下载文件"""
        downloads_dir = Path.home() / "Downloads"
        card_files = list(downloads_dir.glob(pattern))

        if card_files:
            # 按修改时间排序，返回最新的
            latest_file = max(card_files, key=lambda f: f.stat().st_mtime)
            return latest_file
        return None

    def cleanup(self):
        """清理资源"""
        if self.driver:
            self.driver.quit()

def main():
    """主函数 - 用于测试"""
    generator = WeChatCardGenerator()

    try:
        if not generator.setup_driver():
            sys.exit(1)

        content = "传统工程里，每加一个功能，下一个功能就更难加。但复合工程的目标相反：让每个功能使下一个功能更容易构建。"

        if generator.generate_card(content):
            latest_file = generator.find_latest_download()
            if latest_file:
                print(f"📁 文件已保存到: {latest_file}")
            else:
                print("⚠️  未找到下载文件")
        else:
            print("❌ 卡片生成失败")

    finally:
        generator.cleanup()

if __name__ == "__main__":
    main()
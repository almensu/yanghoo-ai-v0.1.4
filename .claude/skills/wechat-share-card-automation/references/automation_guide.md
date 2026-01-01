# 微信分享卡片自动化指南

## 安装依赖

### ChromeDriver 安装
```bash
# macOS
brew install chromedriver

# Ubuntu
sudo apt-get install chromium-chromedriver

# Windows
# 从 https://chromedriver.chromium.org/ 下载对应版本
```

### Python 依赖
```bash
pip install selenium requests
```

## 使用方法

### 方法 1: 直接运行自动化脚本
```bash
python scripts/full_automation.py "你的内容"
```

### 方法 2: 结构化输入
```bash
python scripts/full_automation.py "使用 wechat-share-card 生成卡片：- 内容: '产品发布了！'- 作者: '产品经理'- 描述: '专注用户体验'"
```

### 方法 3: JSON 输入
```bash
python scripts/full_automation.py "" --json '{"content": "产品内容", "author": "作者名", "description": "描述"}'
```

## 故障排除

### ChromeDriver 版本问题
```bash
# 检查 Chrome 版本
google-chrome --version

# 下载对应版本的 ChromeDriver
# https://chromedriver.chromium.org/downloads
```

### 端口占用问题
脚本会自动寻找可用端口 (8000-8009)

### 下载位置
默认下载到 `~/Downloads/` 目录，文件名格式: `card-时间戳.png`

## 高级配置

### 自定义下载目录
修改 `scripts/automate_generation.py` 中的 `downloads_dir` 变量

### 自定义模板
在 `assets/templates/` 目录下添加新的 HTML 模板

### 批量生成
```bash
# 创建内容文件
echo -e "内容1\n内容2\n内容3" > contents.txt

# 批量生成
while read content; do
    python scripts/full_automation.py "$content"
done < contents.txt
```
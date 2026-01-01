#!/bin/bash

# 微信分享卡片自动化依赖安装脚本
# 自动检测环境并安装最小依赖

echo "🔍 检查 Node.js 环境..."

if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js"
    echo "💡 安装方法:"
    echo "   macOS: brew install node"
    echo "   Ubuntu: sudo apt install nodejs npm"
    echo "   Windows: 从 https://nodejs.org 下载安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm"
    echo "💡 npm 通常随 Node.js 一起安装"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

echo ""
echo "📦 安装项目依赖..."

# 设置 npm 镜像加速（可选）
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install

echo ""
echo "🎉 安装完成！"
echo ""
echo "🚀 启动方法:"
echo "   npm start                    # 启动服务器"
echo "   node scripts/node_automation.js \"内容\"  # 一键生成"
echo ""
echo "🌐 访问地址: http://localhost:8000"
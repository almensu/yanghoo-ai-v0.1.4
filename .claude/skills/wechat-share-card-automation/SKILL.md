---
name: wechat-share-card-automation
description: 超快启动的微信分享卡片自动化生成器，使用 Node.js 实现 1 秒启动，零配置运行。支持自然语言输入、一键生成、自动下载到本地。当用户需要创建微信分享卡片时使用，自动处理启动服务、内容填充、生成下载的全流程。
---

# 微信分享卡片自动化生成器 (Node.js 版)

## 🚀 超快启动体验

**启动时间**: 1-2 秒 (vs Python 的 5-8 秒)
**依赖大小**: 仅 50MB (vs Python+Selenium 的 200MB+)
**内存占用**: <50MB (轻量级运行)

## 快速开始

### 一句话生成
```
使用 wechat-share-card 生成卡片，内容"新产品发布了！"
```

### 完整配置
```
使用 wechat-share-card 生成卡片：
- 内容: "我们的新产品发布了！支持智能语音助手，让生活更便捷。"
- 作者: "产品经理小王"
- 描述: "专注用户体验，打造智能生活"
```

## 自动化流程

### 1. 超快启动服务
使用 Node.js + Express (1-2 秒启动)
- 自动端口检测 (8000-8009)
- 零配置运行
- 内置图片服务

### 2. 动态内容处理系统 ⭐
支持三种内容传递方式：

#### **方式 1: localStorage 注入 (自动化脚本)**
- 终端传入内容参数
- 脚本通过 `localStorage.setItem('wechatCardConfig', JSON.stringify(config))` 注入
- 页面自动读取并刷新渲染
- **优先级最高**，适用于自动化流程

#### **方式 2: URL 参数传递**
- 访问: `http://localhost:8000/?context=xxx&author=xxx&description=xxx`
- 页面解析 URL 参数并自动填充
- 适用于手动访问和分享链接

#### **方式 3: 默认配置**
- 硬编码的默认内容
- 作为兜底方案
- **优先级最低**

#### **内容优先级**
```
localStorage > URL参数 > 默认配置
```

### 3. 智能内容解析
- 自然语言识别 (`内容"xxx"`, `作者"xxx"`, `描述"xxx"`)
- JSON 结构提取
- 多格式输入支持

### 4. 自动化生成
- 使用 Puppeteer (无界面浏览器)
- 通过 localStorage 注入内容到页面
- 自动点击下载按钮
- 生成并下载到 Downloads
- 完成后自动清理

## 技术实现

### 核心脚本
- **server.js**: Node.js 服务器 (1-2 秒启动)
- **node_automation.js**: 一键自动化脚本
- **install.sh**: 智能依赖安装

### 依赖管理
- **package.json**: 最小依赖配置
- **express**: 轻量级 Web 服务
- **puppeteer**: 浏览器自动化
- **无 Python 依赖**: 完全 Node.js 生态

## 使用方法

### 方法 1: 一键启动 (推荐)
```bash
# 首次运行 - 自动安装依赖
./scripts/install.sh

# 生成卡片 - 只传入内容，author和description使用默认值
node scripts/node_automation.js "你的内容"
```

**流程说明:**
1. 脚本启动 Node.js 服务器 (1-2 秒)
2. 解析终端传入的内容参数
3. 通过 Puppeteer 打开网页
4. 将内容通过 localStorage 注入页面（只替换context）
5. 页面自动刷新并渲染新内容
6. 自动点击下载按钮
7. 文件保存到 ~/Downloads/

**重要说明**:
- **author** 默认: "Yanghoo205" (保持不变，除非明确指定)
- **description** 默认: "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己" (保持不变，除非明确指定)

### 方法 2: 服务模式
```bash
# 启动持久服务
npm start

# 另一个终端调用 API
curl -X POST http://localhost:8000/api/quick-generate \
  -H "Content-Type: application/json" \
  -d '{"input": "使用 wechat-share-card 生成卡片，内容\'产品发布\'"}'
```

### 方法 3: URL 参数模式 (手动访问)
```bash
# 启动服务后，通过 URL 直接传递内容
open "http://localhost:8000/?context=新产品发布&author=产品经理&description=专注用户体验"
```

### 方法 4: 快速模式
```bash
node scripts/node_automation.js --quick "使用 wechat-share-card 生成卡片，内容'xxx'"
```

## 动态内容系统详解

### 终端输入示例
```bash
# 简单内容 - 只修改内容，author和description使用默认值
node scripts/node_automation.js "以测试为后盾：将测试置于首要地位"

# 完整指定 - 只有明确指定时才会修改author和description
node scripts/node_automation.js "使用 wechat-share-card 生成卡片：- 内容: '我们的新产品发布了！'- 作者: '产品经理'- 描述: '专注用户体验'"
```

### 内容传递流程
1. **终端输入** → 脚本解析
2. **脚本启动** → Puppeteer 打开页面
3. **localStorage 注入** → 页面接收配置（只替换有值的字段）
4. **页面刷新** → React 重新渲染
5. **自动下载** → 卡片保存到 Downloads

### 支持的内容格式
- **简单文本**（推荐）: `"产品发布内容"` - 只修改内容，保持默认author和description
- **引号格式**: `内容"xxx"` - 只修改内容
- **结构化**: `内容"xxx" 作者"xxx" 描述"xxx"` - 修改所有字段
- **完整格式**: `使用 wechat-share-card 生成卡片：- 内容: "xxx"- 作者: "xxx"- 描述: "xxx"` - 修改所有字段

### 默认值说明
- **默认author**: "Yanghoo205" - 固定不变，除非用户明确指定
- **默认description**: "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己" - 固定不变，除非用户明确指定
- **默认content**: 无，必须由用户提供

## 资源文件
- **assets/references/**: 本地图片资源
- **references/automation_guide.md**: 详细技术文档
- **index.html**: 网页界面模板

## 故障排除

### 常见问题
- **端口被占用**: 自动使用 8001、8002 等备用端口
- **浏览器启动失败**: 提供手动访问链接
- **下载失败**: 重试机制和错误诊断

### 日志和调试
所有操作记录在 `/tmp/wechat-card-automation.log` 用于问题诊断。

## 扩展功能

### 批量生成
支持批量生成多个卡片：
```
使用 wechat-share-card 批量生成卡片：
- 内容1: "第一个内容"
- 内容2: "第二个内容"
```

### 自定义模板
支持不同风格的卡片模板，参考 `assets/templates/` 目录。

## 使用示例

### 示例 1: 简单生成
用户输入:
```
使用 wechat-share-card 生成卡片，内容"这是一个很棒的产品分享"
```

### 示例 2: 完整配置
用户输入:
```
使用 wechat-share-card 生成卡片：
- 内容: "我们的新产品发布了！支持智能语音助手，让生活更便捷。"
- 作者: "产品经理小王"
- 描述: "专注用户体验，打造智能生活"
```

技能会自动完成所有技术步骤，用户只需要提供内容即可。
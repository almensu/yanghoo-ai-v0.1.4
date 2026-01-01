import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 静态文件服务
app.use(express.static(__dirname));

// 解析 JSON 请求体
app.use(express.json());

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 本地图片页面路由
app.get('/local-images', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API 端点：生成卡片
app.post('/api/generate-card', async (req, res) => {
    try {
        const { content, author, description } = req.body;

        // 🔥 默认值处理：只替换明确提供的字段
        const config = {
            content: content || "默认内容", // content必须有值
            author: author || "Yanghoo205", // 默认author
            description: description || "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己" // 默认description
        };

        console.log('🎨 开始生成卡片...');
        console.log(`📝 接收内容: ${content?.substring(0, 50)}...`);
        console.log(`👤 Author: ${config.author}`);
        console.log(`📝 Description: ${config.description?.substring(0, 30)}...`);

        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 设置下载路径
        const downloadsDir = path.join(require('os').homedir(), 'Downloads');
        await page._client().send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadsDir
        });

        // 访问本地页面
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

        // 🔥 关键修复：直接通过 localStorage 注入配置（包含默认值处理）
        await page.evaluate((configData) => {
            // 设置 localStorage
            localStorage.setItem('wechatCardConfig', JSON.stringify(configData));

            // 触发页面刷新以应用新配置
            window.location.reload();
        }, config);

        // 等待页面重新加载
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // 验证配置是否正确注入
        const injectedConfig = await page.evaluate(() => {
            const config = localStorage.getItem('wechatCardConfig');
            return config ? JSON.parse(config) : null;
        });

        console.log(`🔍 注入配置验证:`, injectedConfig?.context?.substring(0, 30) + '...');

        if (!injectedConfig || !injectedConfig.context) {
            throw new Error('配置注入失败');
        }

        // 点击下载按钮
        await page.click('button[onclick*="downloadCard"]');

        // 等待下载完成
        await page.waitForTimeout(5000); // 增加等待时间

        await browser.close();

        // 查找最新下载的文件
        const files = fs.readdirSync(downloadsDir).filter(f => f.startsWith('card-') && f.endsWith('.png'));
        if (files.length > 0) {
            const latestFile = files.sort((a, b) => {
                const statA = fs.statSync(path.join(downloadsDir, a));
                const statB = fs.statSync(path.join(downloadsDir, b));
                return statB.mtime - statA.mtime;
            })[0];

            const result = {
                success: true,
                filename: latestFile,
                path: path.join(downloadsDir, latestFile),
                message: `卡片生成成功，文件: ${latestFile}`
            };

            console.log(`✅ ${result.message}`);
            res.json(result);
        } else {
            res.json({ success: false, error: '未找到下载文件' });
        }

    } catch (error) {
        console.error('❌ 生成失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// API 端点：快速生成（简化版）
app.post('/api/quick-generate', (req, res) => {
    const { input } = req.body;

    // 解析输入内容
    let content = input;
    let author = "Yanghoo205";
    let description = "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己";

    // 简单解析
    if (input.includes('内容"')) {
        const match = input.match(/内容"([^"]*)"/);
        if (match) content = match[1];
    }

    if (input.includes('作者"')) {
        const match = input.match(/作者"([^"]*)"/);
        if (match) author = match[1];
    }

    if (input.includes('描述"')) {
        const match = input.match(/描述"([^"]*)"/);
        if (match) description = match[1];
    }

    // 立即响应，后台处理
    res.json({
        success: true,
        message: "正在生成卡片...",
        data: { content, author, description }
    });

    // 异步处理（实际项目中可以用队列）
    setTimeout(async () => {
        try {
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            const downloadsDir = path.join(require('os').homedir(), 'Downloads');
            await page._client().send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadsDir
            });

            await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

            await page.evaluate((data) => {
                document.getElementById('context').value = data.content;
                document.getElementById('author').value = data.author;
                document.getElementById('description').value = data.description;
            }, { content, author, description });

            await page.click('button[onclick*="downloadCard"]');
            await page.waitForTimeout(3000);

            await browser.close();
            console.log('✅ 卡片生成完成');
        } catch (error) {
            console.error('❌ 生成失败:', error);
        }
    }, 100);
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

// 调试端点：验证页面配置
app.get('/debug-config', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

        // 获取当前页面配置
        const config = await page.evaluate(() => {
            const localConfig = localStorage.getItem('wechatCardConfig');
            const urlParams = new URLSearchParams(window.location.search);

            return {
                localStorage: localConfig ? JSON.parse(localConfig) : null,
                urlParams: {
                    context: urlParams.get('context'),
                    author: urlParams.get('author'),
                    description: urlParams.get('description')
                }
            };
        });

        await browser.close();

        res.json({
            success: true,
            config,
            message: '配置检查完成'
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 微信分享卡片服务已启动`);
    console.log(`🌐 本地访问: http://localhost:${PORT}`);
    console.log(`📁 服务目录: ${__dirname}`);
});

export default app;
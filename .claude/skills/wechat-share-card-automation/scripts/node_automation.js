#!/usr/bin/env node

/**
 * 微信分享卡片自动化脚本 - Node.js 版本
 * 轻量级，快速启动，最小依赖
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class NodeAutomation {
    constructor() {
        this.serverProcess = null;
        this.port = 8000;
        this.baseUrl = `http://localhost:${this.port}`;
    }

    async findAvailablePort(startPort = 8000) {
        for (let port = startPort; port <= startPort + 10; port++) {
            try {
                const net = await import('net');
                const available = await this.checkPortAvailable(port);
                if (available) return port;
            } catch (error) {
                continue;
            }
        }
        throw new Error('无法找到可用端口');
    }

    checkPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();

            server.listen(port, () => {
                server.close(() => resolve(true));
            });

            server.on('error', () => resolve(false));
        });
    }

    async startServer() {
        console.log('🚀 启动 Node.js 服务...');

        // 检查是否在项目根目录
        const packageJsonPath = join(__dirname, '..', 'package.json');
        if (!existsSync(packageJsonPath)) {
            throw new Error('未找到 package.json，请在正确的目录中运行');
        }

        // 检查 node_modules
        const nodeModulesPath = join(__dirname, '..', 'node_modules');
        if (!existsSync(nodeModulesPath)) {
            console.log('📦 首次运行，正在安装依赖...');
            await this.installDependencies();
        }

        // 找到可用端口
        this.port = await this.findAvailablePort();
        this.baseUrl = `http://localhost:${this.port}`;

        // 启动服务器
        this.serverProcess = spawn('node', [join(__dirname, '..', 'server.js')], {
            env: { ...process.env, PORT: this.port },
            stdio: 'pipe'
        });

        return new Promise((resolve, reject) => {
            let output = '';
            this.serverProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log('📡', data.toString().trim());
                if (output.includes('服务已启动')) {
                    resolve();
                }
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error('❌', data.toString().trim());
            });

            this.serverProcess.on('error', (error) => {
                console.error('❌ 服务器启动失败:', error.message);
                reject(error);
            });

            this.serverProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`服务器进程退出，代码: ${code}`));
                }
            });

            // 超时检查
            setTimeout(() => {
                if (!output.includes('服务已启动')) {
                    reject(new Error('服务器启动超时'));
                }
            }, 5000);
        });
    }

    async installDependencies() {
        return new Promise((resolve, reject) => {
            const npmProcess = spawn('npm', ['install'], {
                cwd: join(__dirname, '..'),
                stdio: 'inherit'
            });

            npmProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ 依赖安装完成');
                    resolve();
                } else {
                    reject(new Error('依赖安装失败'));
                }
            });
        });
    }

    parseInput(inputText) {
        const result = {
            content: "",
            author: "Yanghoo205",
            description: "没什么改变世界的宏愿，只是想在 AI 的协助下，顺便用代码给世界修修补补——主要是修补我自己"
        };

        // 提取内容
        if (inputText.includes('内容"')) {
            const match = inputText.match(/内容"([^"]*)"/);
            if (match) result.content = match[1];
        } else if (inputText.includes('"')) {
            const firstQuote = inputText.indexOf('"');
            const secondQuote = inputText.indexOf('"', firstQuote + 1);
            if (secondQuote > firstQuote) {
                result.content = inputText.substring(firstQuote + 1, secondQuote);
            }
        } else {
            result.content = inputText;
        }

        // 提取作者
        if (inputText.includes('作者"')) {
            const match = inputText.match(/作者"([^"]*)"/);
            if (match) result.author = match[1];
        }

        // 提取描述
        if (inputText.includes('描述"')) {
            const match = inputText.match(/描述"([^"]*)"/);
            if (match) result.description = match[1];
        }

        return result;
    }

    async generateCard(content, author, description) {
        try {
            console.log('🎨 生成卡片...');
            console.log(`📝 内容: ${content.substring(0, 50)}...`);

            const browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // 设置下载路径
            const os = await import('os');
            const downloadsDir = path.join(os.homedir(), 'Downloads');
            await page._client().send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadsDir
            });

            // 访问页面并注入配置
            await page.goto(`${this.baseUrl}`, { waitUntil: 'networkidle2' });

            // 在页面加载后，通过 localStorage 注入配置
            await page.evaluate((config) => {
                localStorage.setItem('wechatCardConfig', JSON.stringify(config));
                // 刷新页面以应用新配置
                window.location.reload();
            }, { context: content, author, description });

            // 等待页面重新加载
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // 点击下载按钮
            await page.click('button[onclick*="downloadCard"]');

            // 等待下载完成
            await page.waitForTimeout(3000);

            await browser.close();

            // 查找最新下载的文件
            const fs = await import('fs');
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
                    path: path.join(downloadsDir, latestFile)
                };

                console.log(`✅ 卡片生成成功!`);
                console.log(`📁 文件: ${result.filename}`);
                console.log(`📍 路径: ${result.path}`);
                return result;
            } else {
                console.error('❌ 未找到下载文件');
                return null;
            }

        } catch (error) {
            console.error('❌ 生成失败:', error.message);
            return null;
        }
    }

    async quickGenerate(input) {
        try {
            console.log('⚡ 快速生成模式...');

            const response = await fetch(`${this.baseUrl}/api/quick-generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input })
            });

            const result = await response.json();
            console.log('📤', result.message);

            return result;
        } catch (error) {
            console.error('❌ 快速生成失败:', error.message);
            return null;
        }
    }

    async cleanup() {
        console.log('🧹 清理资源...');
        if (this.serverProcess) {
            this.serverProcess.kill('SIGTERM');
            this.serverProcess = null;
        }
        console.log('✅ 清理完成');
    }
}

// 命令行接口
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('用法:');
        console.log('  node scripts/node_automation.js "你的内容"');
        console.log('  node scripts/node_automation.js --quick "使用 wechat-share-card 生成卡片，内容\'xxx\'"');
        process.exit(1);
    }

    const automation = new NodeAutomation();

    try {
        // 启动服务器
        await automation.startServer();
        console.log(`✅ 服务就绪: ${automation.baseUrl}`);

        if (args[0] === '--quick' && args[1]) {
            // 快速模式
            await automation.quickGenerate(args[1]);
            console.log('🎉 卡片正在后台生成...');
        } else {
            // 完整模式
            const parsed = automation.parseInput(args.join(' '));
            await automation.generateCard(parsed.content, parsed.author, parsed.description);
        }

        // 保持服务运行一段时间
        setTimeout(async () => {
            await automation.cleanup();
            process.exit(0);
        }, 5000);

    } catch (error) {
        console.error('❌ 发生错误:', error.message);
        await automation.cleanup();
        process.exit(1);
    }
}

// 优雅退出
process.on('SIGINT', async () => {
    console.log('\n🛑 收到中断信号...');
    await automation.cleanup();
    process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default NodeAutomation;
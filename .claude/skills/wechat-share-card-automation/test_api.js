#!/usr/bin/env node

/**
 * 快速 API 测试脚本
 * 用于验证内容传递是否正常工作
 */

import http from 'http';

const testContent = `以测试为后盾：将测试置于首要地位，要求模型为它生成的每一处修改编写测试，并将测试失败作为反馈回路，以此自动化调试过程。这种方法通过不断的测试-修复循环，确保代码质量和稳定性。`;

const postData = JSON.stringify({
    content: testContent,
    author: "测试用户",
    description: "自动化测试验证"
});

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/generate-card',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 开始 API 测试...');
console.log(`📝 测试内容: ${testContent.substring(0, 50)}...`);

const req = http.request(options, (res) => {
    console.log(`📡 状态码: ${res.statusCode}`);
    console.log(`📋 响应头: ${JSON.stringify(res.headers)}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('📦 响应结果:', result);

            if (result.success) {
                console.log(`✅ 测试成功！文件: ${result.filename}`);
                console.log(`📍 路径: ${result.path}`);
            } else {
                console.error(`❌ 测试失败: ${result.error}`);
            }
        } catch (e) {
            console.error('❌ JSON 解析失败:', e);
            console.log('原始响应:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ 请求错误: ${e.message}`);
});

// 发送请求数据
req.write(postData);
req.end();

console.log('📤 请求已发送...');
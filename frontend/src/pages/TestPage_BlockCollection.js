import React, { useEffect } from 'react';
import { ProjectManager } from '../utils/ProjectManager';
import BlockCollectionPage from './BlockCollectionPage';

const projectManager = new ProjectManager();

// 模拟测试数据
const createTestData = () => {
  // 创建测试项目
  const project1 = projectManager.createProject('AI 学习笔记', '收集关于人工智能和机器学习的精华内容');
  const project2 = projectManager.createProject('前端开发技巧', '前端开发中的实用技巧和最佳实践');
  const project3 = projectManager.createProject('产品设计思考', '产品设计相关的思考和案例分析');

  // 添加测试 blocks 到项目1
  if (project1) {
    projectManager.addBlock(project1.id, {
      taskUuid: 'test-uuid-1',
      taskTitle: 'AI 基础概念讲解',
      filename: 'ai_basics.md',
      blockId: 'block-1',
      blockIndex: 1,
      totalBlocks: 5,
      docId: 'doc-1',
      category: 'transcripts',
      content: `# 什么是人工智能？

人工智能（Artificial Intelligence，AI）是指由人制造出来的机器所表现出来的智能。通常人工智能是指通过普通计算机程序来呈现人类智能的技术。

## 核心特征
- **学习能力**: 能够从数据中学习和改进
- **推理能力**: 能够基于已知信息做出逻辑推断  
- **适应性**: 能够适应新的环境和任务`,
      type: 'heading',
      timestamp: { start: 120, end: 180 },
      source: 'block-editor'
    });

    projectManager.addBlock(project1.id, {
      taskUuid: 'test-uuid-1',
      taskTitle: 'AI 基础概念讲解',
      filename: 'ai_basics.md',
      blockId: 'block-2',
      blockIndex: 2,
      totalBlocks: 5,
      docId: 'doc-1',
      category: 'transcripts',
      content: `\`\`\`python
# 简单的机器学习示例
from sklearn.linear_model import LinearRegression
import numpy as np

# 创建训练数据
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# 训练模型
model = LinearRegression()
model.fit(X, y)

# 预测
prediction = model.predict([[6]])
print(f"预测结果: {prediction[0]}")
\`\`\``,
      type: 'code',
      timestamp: { start: 300, end: 420 },
      source: 'block-editor'
    });

    projectManager.addBlock(project1.id, {
      taskUuid: 'test-uuid-2',
      taskTitle: '深度学习实践',
      filename: 'deep_learning.md',
      blockId: 'block-3',
      blockIndex: 3,
      totalBlocks: 8,
      docId: 'doc-2',
      category: 'analysis',
      content: `> 深度学习的核心思想是构建多层神经网络，通过大量数据的训练，让网络自动学习特征表示。这种方法在图像识别、自然语言处理、语音识别等领域取得了突破性进展。

关键优势：
- 自动特征提取
- 端到端学习
- 强大的表示能力`,
      type: 'quote',
      timestamp: { start: 45, end: 120 },
      source: 'manual'
    });
  }

  // 添加测试 blocks 到项目2
  if (project2) {
    projectManager.addBlock(project2.id, {
      taskUuid: 'test-uuid-3',
      taskTitle: 'React 最佳实践',
      filename: 'react_tips.md',
      blockId: 'block-4',
      blockIndex: 1,
      totalBlocks: 6,
      docId: 'doc-3',
      category: 'user_documents',
      content: `## React Hooks 使用技巧

### 1. 使用 useMemo 优化性能
\`\`\`javascript
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
\`\`\`

### 2. 自定义 Hook 复用逻辑
\`\`\`javascript
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  return [storedValue, setValue];
};
\`\`\``,
      type: 'heading',
      source: 'block-editor'
    });

    projectManager.addBlock(project2.id, {
      taskUuid: 'test-uuid-3',
      taskTitle: 'React 最佳实践',
      filename: 'react_tips.md',
      blockId: 'block-5',
      blockIndex: 2,
      totalBlocks: 6,
      docId: 'doc-3',
      category: 'user_documents',
      content: `CSS-in-JS 的优势在于：

1. **作用域隔离**: 避免样式冲突
2. **动态样式**: 基于 props 和 state 动态生成样式
3. **代码分割**: 样式与组件一起加载
4. **类型安全**: TypeScript 支持

推荐使用 styled-components 或 emotion 等成熟的解决方案。`,
      type: 'paragraph',
      source: 'manual'
    });
  }

  // 添加测试 blocks 到项目3
  if (project3) {
    projectManager.addBlock(project3.id, {
      taskUuid: 'test-uuid-4',
      taskTitle: '用户体验设计原则',
      filename: 'ux_principles.md',
      blockId: 'block-6',
      blockIndex: 1,
      totalBlocks: 4,
      docId: 'doc-4',
      category: 'system_generated',
      content: `# 用户体验设计的黄金法则

## 1. 简单性原则
设计应该尽可能简单，减少用户的认知负担。每个界面元素都应该有明确的目的。

## 2. 一致性原则
保持设计语言的一致性，包括：
- 视觉风格一致
- 交互模式一致  
- 信息架构一致

## 3. 反馈原则
用户的每个操作都应该得到及时、明确的反馈，让用户知道系统的状态。`,
      type: 'heading',
      timestamp: { start: 60, end: 180 },
      source: 'block-editor'
    });

    projectManager.addBlock(project3.id, {
      taskUuid: 'test-uuid-4',
      taskTitle: '用户体验设计原则',
      filename: 'ux_principles.md',
      blockId: 'block-7',
      blockIndex: 2,
      totalBlocks: 4,
      docId: 'doc-4',
      category: 'system_generated',
      content: `| 设计原则 | 重要性 | 实施难度 | 影响范围 |
|---------|--------|----------|----------|
| 简单性 | ⭐⭐⭐⭐⭐ | 中等 | 全局 |
| 一致性 | ⭐⭐⭐⭐⭐ | 困难 | 全局 |
| 反馈性 | ⭐⭐⭐⭐ | 简单 | 局部 |
| 容错性 | ⭐⭐⭐ | 中等 | 局部 |`,
      type: 'table',
      source: 'manual'
    });
  }
};

const TestPage_BlockCollection = () => {
  useEffect(() => {
    // 清除现有数据并创建测试数据
    const existingProjects = projectManager.getAllProjects();
    if (Object.keys(existingProjects).length === 0) {
      createTestData();
    }
  }, []);

  return (
    <div className="h-full">
      <div className="bg-blue-50 border-b border-blue-200 p-3">
        <div className="text-sm text-blue-800">
          <strong>测试模式</strong> - 这是 Block 收藏馆的演示页面，包含模拟数据用于测试功能
        </div>
      </div>
      <div className="h-full">
        <BlockCollectionPage />
      </div>
    </div>
  );
};

export default TestPage_BlockCollection; 
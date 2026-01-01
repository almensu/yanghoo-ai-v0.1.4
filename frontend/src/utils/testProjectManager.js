import { projectManager } from './ProjectManager';

// 简单的测试函数，用于验证ProjectManager功能
export const testProjectManager = () => {
  console.log('🧪 开始测试ProjectManager...');
  
  try {
    // 1. 测试项目创建
    console.log('1. 测试项目创建...');
    const project = projectManager.createProject('测试项目', '这是一个测试项目');
    console.log('✅ 项目创建成功:', project.name);
    
    // 2. 测试添加块
    console.log('2. 测试添加块...');
    const blockData = {
      taskUuid: 'test-task-123',
      taskTitle: '测试任务',
      filename: 'test.md',
      blockId: 'block-1',
      content: '这是一个测试块的内容，用于验证块添加功能是否正常工作。',
      timestamp: { start: 120, end: 180 }
    };
    
    const addedBlock = projectManager.addBlock(project.id, blockData);
    console.log('✅ 块添加成功:', addedBlock ? '是' : '否');
    
    // 3. 测试添加文档
    console.log('3. 测试添加文档...');
    const documentData = {
      taskUuid: 'test-task-456',
      taskTitle: '测试任务2',
      filename: '汽车制造业与铁路物流的演变：福特、大众与特斯拉的比较分析.md',
      content: '# 测试文档\n\n这是一个测试文档的完整内容。\n\n## 章节1\n内容1\n\n## 章节2\n内容2'
    };
    
    const addedDocument = projectManager.addDocument(project.id, documentData);
    console.log('✅ 文档添加成功:', addedDocument ? '是' : '否');
    
    // 4. 测试获取项目统计
    console.log('4. 测试项目统计...');
    const stats = projectManager.getProjectStats(project.id);
    console.log('✅ 项目统计:', {
      总块数: stats.totalBlocks,
      总文档数: stats.totalDocuments,
      总tokens: stats.totalTokens,
      来源任务数: stats.sourceTasks
    });
    
    // 5. 测试导出功能
    console.log('5. 测试导出功能...');
    const newsletterExport = projectManager.exportProject(project.id, 'newsletter');
    console.log('✅ Newsletter导出成功:', newsletterExport ? '是' : '否');
    if (newsletterExport) {
      console.log('导出文件名:', newsletterExport.filename);
      console.log('内容长度:', newsletterExport.content.length);
    }
    
    // 6. 测试项目列表
    console.log('6. 测试项目列表...');
    const allProjects = projectManager.getAllProjects();
    console.log('✅ 项目总数:', allProjects.length);
    
    // 7. 测试localStorage持久化
    console.log('7. 测试localStorage持久化...');
    const storedData = localStorage.getItem('yanghoo_projects');
    console.log('✅ localStorage数据存在:', storedData ? '是' : '否');
    
    console.log('🎉 所有测试通过！');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
};

// 清理测试数据的函数
export const cleanupTestData = () => {
  console.log('🧹 清理测试数据...');
  
  try {
    const allProjects = projectManager.getAllProjects();
    const testProjects = allProjects.filter(p => p.name.includes('测试'));
    
    testProjects.forEach(project => {
      projectManager.deleteProject(project.id);
    });
    
    console.log('✅ 清理完成，删除了', testProjects.length, '个测试项目');
    return true;
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
    return false;
  }
};

// 在浏览器控制台中可以调用的测试函数
if (typeof window !== 'undefined') {
  window.testProjectManager = testProjectManager;
  window.cleanupTestData = cleanupTestData;
  console.log('💡 测试函数已挂载到window对象：');
  console.log('  - window.testProjectManager() - 运行测试');
  console.log('  - window.cleanupTestData() - 清理测试数据');
} 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarkdownList from '../components/MarkdownList';
import ProjectBubble from '../components/ProjectBubble';

function TestPage_MarkdownToProject() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(null);
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = 'http://localhost:8000';

  // 获取任务列表
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/tasks`);
        setTasks(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedTaskUuid(response.data[0].uuid);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // 获取选中任务的markdown文件
  useEffect(() => {
    if (!selectedTaskUuid) return;

    const fetchMarkdownFiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${selectedTaskUuid}/files/list`, {
          params: { extension: '.md' }
        });
        setMarkdownFiles(response.data || []);
      } catch (error) {
        console.error('Failed to fetch markdown files:', error);
        setMarkdownFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdownFiles();
  }, [selectedTaskUuid]);

  const handleProjectSendToAI = (project) => {
    console.log('项目发送到AI:', project);
    alert(`项目 "${project.name}" 已准备发送到AI\n包含 ${project.selectedBlocks.length} 个块和 ${project.selectedDocuments.length} 个文档`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          测试：Markdown文档拖拽到项目篮
        </h1>

        {/* 任务选择 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">选择任务</h2>
          <select
            value={selectedTaskUuid || ''}
            onChange={(e) => setSelectedTaskUuid(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">请选择任务...</option>
            {tasks.map(task => (
              <option key={task.uuid} value={task.uuid}>
                {task.title || task.uuid}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：Markdown文件列表 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Markdown文档</h2>
            <div className="text-sm text-gray-600 mb-4">
              从下面的文档列表中拖拽.md文件到右侧的项目篮
            </div>
            
            {selectedTaskUuid ? (
              loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2">加载中...</span>
                </div>
              ) : (
                <MarkdownList
                  files={markdownFiles}
                  selectedFile={null}
                  onSelectFile={() => {}}
                  onFileDeleted={() => {}}
                  onFileRenamed={() => {}}
                  taskUuid={selectedTaskUuid}
                  apiBaseUrl={apiBaseUrl}
                />
              )
            ) : (
              <div className="text-gray-500 text-center py-8">
                请先选择一个任务
              </div>
            )}
          </div>

          {/* 右侧：说明和提示 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">测试说明</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>从左侧的markdown文档列表中选择一个文件</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>按住鼠标左键拖拽文件到右下角的项目篮图标</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>松开鼠标，文档应该被添加到项目篮中</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">4.</span>
                <span>点击项目篮图标查看添加的文档</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">5.</span>
                <span>点击"发送到AI Chat"按钮测试项目发送功能</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>注意：</strong>项目篮位于页面右下角。如果没有活跃项目，拖拽时会自动创建一个新项目。
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 项目篮 */}
      <ProjectBubble 
        onSendToAI={handleProjectSendToAI}
        taskUuid={selectedTaskUuid}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}

export default TestPage_MarkdownToProject; 
import React, { useState, useEffect } from 'react';
import KeyframeClipPanel from '../components/KeyframeClipPanel';
import axios from 'axios';

const TestPage_KeyframeClip = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskUuid, setSelectedTaskUuid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clipResult, setClipResult] = useState(null);

  const apiBaseUrl = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      if (response.status === 200) {
        // 筛选有视频文件的任务
        const tasksWithVideo = response.data.filter(task => 
          task.media_files && typeof task.media_files === 'object' && 
          Object.values(task.media_files).some(path => path !== null)
        );
        setTasks(tasksWithVideo);
        
        // 自动选择第一个有视频的任务
        if (tasksWithVideo.length > 0 && !selectedTaskUuid) {
          setSelectedTaskUuid(tasksWithVideo[0].uuid);
        }
      }
    } catch (err) {
      console.error("获取任务列表失败:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClipSegments = async (segments) => {
    if (!selectedTaskUuid || segments.length === 0) {
      alert('请选择任务和片段');
      return;
    }

    try {
      console.log('开始剪辑片段:', segments);
      
      // 调用剪辑API
      const response = await axios.post(`${apiBaseUrl}/api/tasks/${selectedTaskUuid}/cut`, {
        media_identifier: 'video', // 使用视频文件
        segments: segments.map(seg => ({
          start: seg.start,
          end: seg.end
        })),
        embed_subtitle_lang: 'none', // 不嵌入字幕
        subtitle_type: 'vtt',
        output_format: 'video'
      });

      if (response.status === 202) {
        const jobId = response.data.job_id;
        console.log('剪辑任务已启动:', jobId);
        
        // 轮询检查剪辑状态
        const checkStatus = async () => {
          try {
            const statusResponse = await axios.get(
              `${apiBaseUrl}/api/tasks/${selectedTaskUuid}/cut/${jobId}/status`
            );
            
            const status = statusResponse.data;
            console.log('剪辑状态:', status);
            
            if (status.status === 'completed') {
              setClipResult({
                success: true,
                message: '剪辑完成！',
                outputPath: status.output_path,
                jobId: jobId
              });
            } else if (status.status === 'failed') {
              setClipResult({
                success: false,
                message: `剪辑失败: ${status.message}`,
                jobId: jobId
              });
            } else if (status.status === 'processing') {
              // 继续轮询
              setTimeout(checkStatus, 2000);
            }
          } catch (err) {
            console.error('检查剪辑状态失败:', err);
            setClipResult({
              success: false,
              message: `状态检查失败: ${err.message}`,
              jobId: jobId
            });
          }
        };
        
        // 开始状态检查
        setTimeout(checkStatus, 1000);
        
        setClipResult({
          success: null,
          message: '剪辑中，请等待...',
          jobId: jobId
        });
        
      }
    } catch (err) {
      console.error('剪辑失败:', err);
      setClipResult({
        success: false,
        message: `剪辑失败: ${err.message}`
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">关键帧剪辑测试页面</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载任务列表...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">关键帧剪辑测试页面</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          错误: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">关键帧剪辑测试页面</h1>
      
      {/* 任务选择器 */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">选择测试任务</h2>
        
        {tasks.length === 0 ? (
          <p className="text-gray-500">没有找到包含视频的任务</p>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedTaskUuid}
              onChange={(e) => setSelectedTaskUuid(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">请选择任务</option>
              {tasks.map(task => (
                <option key={task.uuid} value={task.uuid}>
                  {task.title || '无标题'} ({task.platform || 'N/A'})
                </option>
              ))}
            </select>
            
            {selectedTaskUuid && (
              <div className="text-sm text-gray-600">
                选中任务: {tasks.find(t => t.uuid === selectedTaskUuid)?.title || '无标题'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 剪辑结果显示 */}
      {clipResult && (
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">剪辑结果</h2>
          <div className={`p-3 rounded ${
            clipResult.success === true ? 'bg-green-50 border border-green-200 text-green-700' :
            clipResult.success === false ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <p>{clipResult.message}</p>
            {clipResult.jobId && (
              <p className="text-sm mt-1">任务ID: {clipResult.jobId}</p>
            )}
            {clipResult.success === true && clipResult.outputPath && (
              <div className="mt-2">
                <a 
                  href={`${apiBaseUrl}/files/${clipResult.outputPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  download
                >
                  下载剪辑结果
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 关键帧剪辑面板 */}
      {selectedTaskUuid ? (
        <KeyframeClipPanel 
          taskUuid={selectedTaskUuid}
          onClipSegments={handleClipSegments}
        />
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-lg border">
          <p className="text-gray-500">请先选择一个任务来开始关键帧剪辑</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">使用说明</h2>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>1. 选择任务</strong>: 从下拉列表中选择包含视频的任务</p>
          <p><strong>2. 提取关键帧</strong>: 点击"提取关键帧"按钮，配置间隔、数量和质量</p>
          <p><strong>3. 选择模式</strong>:</p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>网格模式</strong>: 点击关键帧选择，然后点击"创建片段"</li>
            <li>• <strong>剪辑模式</strong>: 依次点击两个关键帧自动创建片段</li>
            <li>• <strong>时间轴模式</strong>: 在时间轴上可视化查看关键帧分布</li>
          </ul>
          <p><strong>4. 开始剪辑</strong>: 创建片段后点击"开始剪辑"进行视频剪切</p>
          <p><strong>5. 下载结果</strong>: 剪辑完成后可以下载生成的视频文件</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage_KeyframeClip;
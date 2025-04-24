import React from 'react';
// Import icons
import { FaVideo, FaVideoSlash, FaHeadphones, FaVolumeMute, FaTrash } from 'react-icons/fa';
// Import more intuitive icons
import { 
  FaFileVideo, FaVideoSlash as FaVideoSlash6, 
  FaFileAudio, FaVolumeXmark, 
  FaDownload, FaMusic, FaClosedCaptioning, FaLanguage
} from 'react-icons/fa6';  // Use fa6 version for updated icons

// Basic placeholder for image loading/error
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000'; 
  const placeholder = "https://via.placeholder.com/150/eeeeee/999999?text=No+Image";

  React.useEffect(() => {
    // Reset error state if src prop changes
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const onError = () => {
    // Only set error flag if it wasn't already the placeholder
    if (finalSrc !== placeholder) {
        setError(true);
    }
  };

  // Determine the final source URL
  let finalSrc;
  if (error || !currentSrc) {
    // If an error occurred loading the actual image OR if src prop was initially null/empty,
    // use the external placeholder directly.
    finalSrc = placeholder;
  } else if (currentSrc.startsWith('http')) {
     // If src is already an absolute URL (e.g., placeholder), use it.
     // This case might overlap with !currentSrc if placeholder was set initially, which is fine.
     finalSrc = currentSrc;
  } else {
    // Otherwise, construct the backend URL
    // Strip "data/" prefix 
    const relativePath = currentSrc.startsWith('data/') ? currentSrc.substring(5) : currentSrc;
    finalSrc = `${backendUrl}/files/${relativePath}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};


function CardView({ tasks, onDelete, onDownloadRequest, onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt, onDeleteVtt }) {
  if (!tasks || tasks.length === 0) {
    // This case is handled in App.js, but good practice to check
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];

  // Helper function to check if video exists (at least one non-null path)
  const hasVideo = (mediaFiles) => {
    return mediaFiles && typeof mediaFiles === 'object' && Object.values(mediaFiles).some(path => path !== null);
  };

  // Helper function to check if audio exists
  const hasAudio = (audioPath) => {
    return !!audioPath; // Simple truthiness check is fine if it's null or a string path
  };

  // Helper function to check if VTT exists for a specific language
  const hasVtt = (vttFiles, langCode) => {
    return vttFiles && typeof vttFiles === 'object' && !!vttFiles[langCode];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tasks.map((task) => {
        const videoExists = hasVideo(task.media_files);
        const audioExists = hasAudio(task.extracted_wav_path);
        // Check for specific VTT files
        const vttEnExists = hasVtt(task.vtt_files, 'en');
        const vttZhExists = hasVtt(task.vtt_files, 'zh-Hans'); // Assuming 'zh-Hans' for Simplified Chinese
        const isYouTube = task.platform === 'youtube';

        return (
          <div key={task.uuid} className="card bg-base-100 shadow-xl border border-base-300">
            <figure className="h-48 overflow-hidden"> {/* Fixed height for image area */}
               <ImageWithFallback 
                 src={task.thumbnail_path}
                 alt={task.title || 'Thumbnail'} 
                 className="object-cover w-full h-full" // Cover ensures image fills the area
                />
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title text-base line-clamp-2" title={task.title}> {/* Limit title lines */} 
                {task.title || 'No Title'}
              </h2>
              <p className="text-xs text-gray-500 truncate" title={task.url}>{task.url}</p>
              
              {/* 平台徽章 */}
              <div className="mt-2">
                <span className="badge badge-outline badge-sm">{task.platform}</span>
              </div>

              {/* 媒体状态和操作区 - 视频部分 */}
              <div className="flex justify-between items-center mt-3 mb-1 border-t pt-2">
                {/* 视频状态图标和标签 */}
                <div className="flex items-center gap-1">
                  <span className={`text-lg ${videoExists ? 'text-success' : 'text-gray-400'}`}>
                    {videoExists ? <FaFileVideo /> : <FaVideoSlash6 />}
                  </span>
                  <span className="text-sm">{videoExists ? "视频已下载" : "无视频"}</span>
                </div>
                
                {/* 视频操作按钮 */}
                <div className="flex gap-1">
                  {/* 下载视频按钮 */}
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className="btn btn-success btn-xs btn-outline flex items-center gap-1">
                      <FaDownload size="0.85em" /> 下载
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]">
                      {videoQualities.map(quality => (
                        <li key={quality}>
                          <a onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* 删除视频按钮 */}
                  <button 
                    className={`btn btn-warning btn-xs btn-outline flex items-center gap-1 ${!videoExists ? 'btn-disabled' : ''}`} 
                    onClick={() => onDeleteVideo(task.uuid)}
                    disabled={!videoExists}
                    title="删除视频文件"
                  >
                    <FaTrash size="0.85em" /> 删除
                  </button>
                </div>
              </div>
              
              {/* 媒体状态和操作区 - 音频部分 */}
              <div className="flex justify-between items-center mt-2 mb-1 border-t pt-2">
                {/* 音频状态图标和标签 */}
                <div className="flex items-center gap-1">
                  <span className={`text-lg ${audioExists ? 'text-accent' : 'text-gray-400'}`}>
                    {audioExists ? <FaFileAudio /> : <FaVolumeXmark />}
                  </span>
                  <span className="text-sm">{audioExists ? "音频已提取" : "无音频"}</span>
                </div>
                
                {/* 音频操作按钮 */}
                <div className="flex gap-1">
                  {/* 提取音频按钮 */}
                  <button 
                    className="btn btn-accent btn-xs btn-outline flex items-center gap-1"
                    onClick={() => onExtractAudio(task.uuid)}
                    disabled={!videoExists}
                    title={!videoExists ? "请先下载视频" : "从视频中提取音频"}
                  >
                    <FaMusic size="0.85em" /> 提取
                  </button>
                  
                  {/* 删除音频按钮 */}
                  <button 
                    className={`btn btn-warning btn-xs btn-outline flex items-center gap-1 ${!audioExists ? 'btn-disabled' : ''}`} 
                    onClick={() => onDeleteAudio(task.uuid)}
                    disabled={!audioExists}
                    title="删除音频文件"
                  >
                    <FaTrash size="0.85em" /> 删除
                  </button>
                </div>
              </div>
              
              {/* VTT 部分 - Conditionally render based on platform */}
              {isYouTube && (
                <div className="mt-2 mb-1 border-t pt-2">
                  <div className="flex items-center gap-1 mb-2">
                      <span className={`text-lg ${(vttEnExists || vttZhExists) ? 'text-info' : 'text-gray-400'}`}>
                          <FaClosedCaptioning />
                      </span>
                      <span className="text-sm">字幕 (VTT)</span>
                  </div>
                  <div className="flex flex-col gap-2"> {/* Arrange VTT actions vertically */}
                      {/* English VTT */}
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                              <FaLanguage size="0.9em" /> 
                              <span className={`text-xs ${vttEnExists ? 'font-semibold' : ''}`}>英文</span>
                          </div>
                          <div className="flex gap-1">
                              <button 
                                  className="btn btn-info btn-xs btn-outline flex items-center gap-1"
                                  onClick={() => onDownloadVtt(task.uuid, 'en')}
                                  title="下载英文 VTT"
                              >
                                  <FaDownload size="0.85em" /> 下载
                              </button>
                              <button 
                                  className={`btn btn-warning btn-xs btn-outline flex items-center gap-1 ${!vttEnExists ? 'btn-disabled' : ''}`} 
                                  onClick={() => onDeleteVtt(task.uuid, 'en')}
                                  disabled={!vttEnExists}
                                  title="删除英文 VTT"
                              >
                                  <FaTrash size="0.85em" /> 删除
                              </button>
                          </div>
                      </div>
                      {/* Chinese VTT */}
                      <div className="flex justify-between items-center">
                           <div className="flex items-center gap-1">
                              <FaLanguage size="0.9em" /> 
                              <span className={`text-xs ${vttZhExists ? 'font-semibold' : ''}`}>中文</span>
                          </div>
                          <div className="flex gap-1">
                               <button 
                                  className="btn btn-info btn-xs btn-outline flex items-center gap-1"
                                  onClick={() => onDownloadVtt(task.uuid, 'zh-Hans')} // Use 'zh-Hans' for simplified Chinese
                                  title="下载中文 VTT"
                              >
                                  <FaDownload size="0.85em" /> 下载
                              </button>
                              <button 
                                  className={`btn btn-warning btn-xs btn-outline flex items-center gap-1 ${!vttZhExists ? 'btn-disabled' : ''}`} 
                                  onClick={() => onDeleteVtt(task.uuid, 'zh-Hans')}
                                  disabled={!vttZhExists}
                                  title="删除中文 VTT"
                              >
                                  <FaTrash size="0.85em" /> 删除
                              </button>
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* 删除整个任务的按钮 - 放在底部较明显的位置 */}
              <div className="card-actions justify-end mt-2 pt-1 border-t">
                <button 
                  className="btn btn-error btn-xs flex items-center gap-1" 
                  onClick={() => onDelete(task.uuid)}
                  title="删除整个任务"
                >
                  <FaTrash /> 删除任务
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CardView; 
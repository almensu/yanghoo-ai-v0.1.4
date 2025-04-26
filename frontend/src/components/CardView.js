import React from 'react';
// Import icons from react-icons/fa6 and react-icons/fa
import { 
  FaFileVideo, FaVideoSlash as FaVideoSlash6, 
  FaFileAudio, FaVolumeXmark, 
  FaDownload, FaMusic, FaClosedCaptioning, FaLanguage, FaTrash as FaTrash6, 
  FaHeadphones, FaCodeMerge, FaTv,
  FaMicrophoneLines,
} from 'react-icons/fa6';
// FaArchive seems only available in fa, FaTrash is in both, use FaTrash6 from fa6 consistently
import { FaArchive } from 'react-icons/fa'; 

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
    // Avoid setting error if the placeholder itself failed (though unlikely)
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
     // If src is already an absolute URL (like placeholder or potentially external URL in future), use it.
     finalSrc = currentSrc;
  } else {
    // Otherwise, construct the backend URL assuming currentSrc is relative to the /files mount point
    // No need to strip 'data/' prefix anymore
    finalSrc = `${backendUrl}/files/${currentSrc}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};

function CardView({
  tasks, onDelete, onArchive, onDownloadRequest, onDownloadAudio,
  onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt,
  onDeleteVtt, onMergeVtt, onCreateVideo,
  onTranscribeWhisperX, onDeleteWhisperX
}) {
  // State to store selected WhisperX model for each task
  const [whisperxModels, setWhisperxModels] = React.useState({});

  if (!tasks || tasks.length === 0) {
    // This case is handled in App.js, but good practice to check
    return null;
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];
  const whisperXModelChoices = ['tiny.en', 'small.en', 'medium.en', 'large-v3'];

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

  // Add helper for audio download platforms
  const isAudioPlatform = (platform) => {
      return ['xiaoyuzhou', 'podcast'].includes(platform); // Use same list as backend
  };

  // Helper function to check if merging is possible
  const canMergeVtt = (task) => {
    const vttEnExists = hasVtt(task.vtt_files, 'en');
    const vttZhExists = hasVtt(task.vtt_files, 'zh-Hans');
    return task.platform === 'youtube' && (vttEnExists || vttZhExists) && !task.merged_vtt_md_path && !task.archived;
  }

  // Helper to get the selected model for a task, defaulting to medium.en
  const getSelectedWhisperXModel = (uuid) => {
    return whisperxModels[uuid] || 'medium.en';
  };

  // Handler for changing the selected model
  const handleWhisperXModelChange = (uuid, model) => {
    setWhisperxModels(prev => ({ ...prev, [uuid]: model }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tasks.map((task) => {
        const videoExists = hasVideo(task.media_files);
        const audioExists = hasAudio(task.extracted_wav_path);
        const audioDownloaded = !!task.downloaded_audio_path;
        const canDirectDownloadAudio = isAudioPlatform(task.platform);
        // Check for specific VTT files
        const vttEnExists = hasVtt(task.vtt_files, 'en');
        const vttZhExists = hasVtt(task.vtt_files, 'zh-Hans');
        const isYouTube = task.platform === 'youtube';
        const canMerge = canMergeVtt(task); // Use the helper
        const isMerged = !!task.merged_vtt_md_path;
        // Condition for showing the 'Create Video' button
        const canCreatePodcastVideo = 
            (task.platform === 'xiaoyuzhou' || task.platform === 'podcast') && 
            !!task.thumbnail_path && 
            !!task.downloaded_audio_path && 
            !task.media_files?.best; // Hide if best video already exists

        // --- WhisperX specific checks ---
        const whisperXJsonExists = !!task.whisperx_json_path;
        const hasAudioForTranscription = audioExists || audioDownloaded;
        const selectedWhisperXModel = getSelectedWhisperXModel(task.uuid);
        // TODO: Add a check for transcription in progress if the backend/App.js supports it
        const isTranscribing = false; // Placeholder

        return (
          <div key={task.uuid} className={`card bg-base-100 shadow-md border border-base-200/70 rounded-lg overflow-hidden relative`}>
            {task.archived && (
              <span className="badge badge-warning badge-sm absolute top-2 right-2 z-10">Archived</span>
            )}
            <figure className="h-48 overflow-hidden">
               <ImageWithFallback 
                 src={task.thumbnail_path}
                 alt={task.title || 'Thumbnail'} 
                 className="object-cover w-full h-full"
                />
            </figure>
            <div className={`card-body p-3`}>
              <h2 className="card-title text-sm font-medium line-clamp-2 mb-1" title={task.title}>
                {task.title || 'No Title'}
              </h2>
              <p className="text-xs text-base-content/70 truncate mb-2" title={task.url}>{task.url}</p>
              
              <div className="mb-2">
                <span className="badge badge-ghost badge-sm font-normal">{task.platform}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-base-200/60">
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg ${videoExists ? 'text-success' : 'text-base-content/40'}`}>
                    {videoExists ? <FaFileVideo /> : <FaVideoSlash6 />}
                  </span>
                  <span className="text-xs font-medium">{videoExists ? "视频" : "无视频"}</span>
                </div>
                
                <div className="flex gap-0.5">
                  <div className="dropdown dropdown-end">
                    <button tabIndex={0} className={`btn btn-ghost btn-xs btn-square tooltip tooltip-info hover:bg-base-content/10 flex items-center justify-center`} data-tip="下载视频">
                      <FaDownload size="0.9em" />
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]">
                      {videoQualities.map(quality => (
                        <li key={quality}>
                          <a onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!videoExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                    onClick={() => onDeleteVideo(task.uuid)}
                    disabled={!videoExists}
                    title="删除视频文件"
                    data-tip="删除视频"
                  >
                    <FaTrash6 size="0.9em" /> 
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1 pt-2 border-t border-base-200/60">
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg ${audioExists ? 'text-accent' : (audioDownloaded ? 'text-primary' : 'text-base-content/40')}`}>
                    {audioExists ? <FaFileAudio /> : (audioDownloaded ? <FaHeadphones /> : <FaVolumeXmark />)}
                  </span>
                  <span className="text-xs font-medium">
                      {audioExists ? "已提取" : (audioDownloaded ? "已下载" : "无音频")}
                  </span>
                </div>
                
                <div className="flex gap-0.5">
                  {/* --- NEW: Create Video Button --- */}
                  {canCreatePodcastVideo && (
                    <button 
                      className={`btn btn-ghost btn-xs btn-square tooltip tooltip-secondary text-secondary hover:bg-base-content/10 flex items-center justify-center`} 
                      onClick={() => onCreateVideo(task.uuid)} // Call the new handler
                      title="使用音频和封面图制作视频"
                      data-tip="制作视频"
                    >
                        <FaTv size="0.9em" />
                    </button>
                  )}
                  {/* --- END NEW: Create Video Button --- */}
                  {canDirectDownloadAudio && (
                      <button 
                          className={`btn btn-ghost btn-xs btn-square tooltip tooltip-primary ${audioDownloaded ? 'btn-disabled text-base-content/30' : 'text-primary'} hover:bg-base-content/10 flex items-center justify-center`} 
                          onClick={() => onDownloadAudio(task.uuid)}
                          disabled={audioDownloaded || !task.info_json_path}
                          title={audioDownloaded ? "音频已下载" : (!task.info_json_path ? "需要先获取 Info JSON" : "下载源音频")}
                          data-tip={audioDownloaded ? "音频已下载" : (!task.info_json_path ? "需要先获取 Info JSON" : "下载源音频")}
                      >
                          <FaHeadphones size="0.9em" />
                      </button>
                  )}
                  <button 
                    className={`btn btn-ghost btn-xs btn-square tooltip tooltip-accent ${!videoExists ? 'btn-disabled text-base-content/30' : 'text-accent'} hover:bg-base-content/10 flex items-center justify-center`} 
                    onClick={() => onExtractAudio(task.uuid)}
                    disabled={!videoExists}
                    title={!videoExists ? "请先下载视频" : "从视频中提取音频(.wav)"}
                    data-tip={!videoExists ? "请先下载视频" : "从视频中提取音频(.wav)"}
                  >
                    <FaMusic size="0.9em" />
                  </button>
                  <button 
                    className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning ${!(audioExists || audioDownloaded) ? 'btn-disabled text-base-content/30' : 'text-warning'} hover:bg-base-content/10 flex items-center justify-center`} 
                    onClick={() => onDeleteAudio(task.uuid)}
                    disabled={!(audioExists || audioDownloaded)}
                    title={!(audioExists || audioDownloaded) ? "无音频文件" : "删除提取的音频(.wav)"}
                    data-tip={!(audioExists || audioDownloaded) ? "无音频文件" : "删除提取的音频(.wav)"}
                  >
                    <FaTrash6 size="0.9em" />
                  </button>
                </div>
              </div>
              
              {/* --- Conditional Rendering for YouTube/Podcast Section --- */}
              {isYouTube && (
                 <div className="mt-1 pt-2 border-t border-base-200/60">
                   <div className="flex items-center gap-1.5 mb-1">
                       <span className={`text-lg ${(vttEnExists || vttZhExists) ? 'text-info' : 'text-base-content/40'}`}>
                           <FaClosedCaptioning />
                       </span>
                       <span className="text-xs font-medium mr-auto">字幕 (VTT) {isMerged ? '(已合并)' : ''}</span>
                       
                        {/* Merge Button */}
                        <button 
                            className={`btn btn-ghost btn-xs btn-square tooltip tooltip-secondary ${!canMerge ? 'btn-disabled text-base-content/30' : 'text-secondary'} hover:bg-base-content/10 flex items-center justify-center`} 
                            onClick={() => onMergeVtt(task.uuid)}
                            disabled={!canMerge}
                            title={isMerged ? "字幕已合并为 Markdown" : (!isYouTube ? "仅限 YouTube" : (!(vttEnExists || vttZhExists) ? "需要 EN 或 ZH 字幕" : "合并字幕为 Markdown (表格)"))}
                            data-tip={isMerged ? "字幕已合并" : (!isYouTube ? "仅限 YouTube" : (!(vttEnExists || vttZhExists) ? "缺少字幕" : "合并字幕 (MD)"))}
                        >
                            <FaCodeMerge size="0.9em" /> 
                        </button>
                        
                        {/* Download VTT Button */}
                        <button 
                            className={`btn btn-ghost btn-xs btn-square tooltip tooltip-info ${!task.info_json_path ? 'btn-disabled text-base-content/30' : 'text-info'} hover:bg-base-content/10 flex items-center justify-center`} 
                            onClick={() => onDownloadVtt(task.uuid)}
                            disabled={!task.info_json_path}
                            title={!task.info_json_path ? "需要先获取 Info JSON" : "下载可用 VTT (EN/ZH)"}
                            data-tip={!task.info_json_path ? "获取 Info JSON" : "下载 VTT"}
                        >
                            <FaDownload size="0.9em" />
                        </button>
                   </div>
                   <div className="flex flex-col gap-1">
                       <div className="flex justify-between items-center">
                           <div className="flex items-center gap-1">
                               <FaLanguage size="0.9em" className="text-base-content/70"/> 
                               <span className={`text-xs ${vttEnExists ? 'font-medium' : 'text-base-content/70'}`}>英文</span>
                           </div>
                           <div className="flex gap-0.5">
                               <button 
                                   className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!vttEnExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                                   onClick={() => onDeleteVtt(task.uuid, 'en')}
                                   disabled={!vttEnExists}
                                   title="删除英文 VTT"
                                   data-tip="删除英文 VTT"
                               >
                                   <FaTrash6 size="0.9em" /> 
                               </button>
                           </div>
                       </div>
                       <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                               <FaLanguage size="0.9em" className="text-base-content/70"/> 
                               <span className={`text-xs ${vttZhExists ? 'font-medium' : 'text-base-content/70'}`}>中文</span>
                           </div>
                           <div className="flex gap-0.5">
                                <button 
                                   className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!vttZhExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                                   onClick={() => onDeleteVtt(task.uuid, 'zh-Hans')}
                                   disabled={!vttZhExists}
                                   title="删除中文 VTT"
                                   data-tip="删除中文 VTT"
                               >
                                   <FaTrash6 size="0.9em" />
                               </button>
                           </div>
                       </div>
                   </div>
                 </div>
              )}
              {/* --- End Conditional Rendering --- */}

              {/* --- WhisperX Section --- */}
              <div className="mt-1 pt-2 border-t border-base-200/60">
                  <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-lg ${whisperXJsonExists ? 'text-success' : 'text-base-content/40'}`}>
                          <FaMicrophoneLines />
                      </span>
                      <span className={`text-xs font-medium mr-auto ${whisperXJsonExists ? 'text-success' : ''}`}>
                          字幕 (WhisperX)
                          {whisperXJsonExists && <span className="font-normal text-success/80"> (已完成)</span>}
                          {whisperXJsonExists && task.transcription_model && ` (${task.transcription_model})`}
                      </span>
                      {isTranscribing && <span className="loading loading-spinner loading-xs text-primary ml-2"></span>}
                  </div>

                  <div className="flex flex-col gap-2">
                      <select
                          className={`select select-bordered select-xs w-full ${!hasAudioForTranscription || whisperXJsonExists || isTranscribing ? 'select-disabled' : ''}`}
                          value={selectedWhisperXModel}
                          onChange={(e) => handleWhisperXModelChange(task.uuid, e.target.value)}
                          disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing}
                          title={
                            !hasAudioForTranscription ? "需要先下载或提取音频" :
                            whisperXJsonExists ? "已转录，请先删除" :
                            isTranscribing ? "正在转录中..." : "选择 WhisperX 模型"
                          }
                      >
                          {whisperXModelChoices.map(model => (
                              <option key={model} value={model}>{model}</option>
                          ))}
                      </select>

                      <div className="flex justify-end gap-1">
                           <button
                              className={`btn btn-outline btn-xs btn-primary ${!hasAudioForTranscription || whisperXJsonExists || isTranscribing ? 'btn-disabled' : ''}`}
                              onClick={() => onTranscribeWhisperX(task.uuid, selectedWhisperXModel)}
                              disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing}
                              title={
                                !hasAudioForTranscription ? "需要音频文件" :
                                whisperXJsonExists ? "转录已存在" :
                                isTranscribing ? "正在转录..." : `使用 ${selectedWhisperXModel} 模型转录`
                              }
                          >
                              {isTranscribing ? "转录中..." : (whisperXJsonExists ? "已转录" : "开始转录")}
                          </button>
                          <button
                              className={`btn btn-outline btn-xs btn-warning ${!whisperXJsonExists || isTranscribing ? 'btn-disabled' : ''}`}
                              onClick={() => onDeleteWhisperX(task.uuid)}
                              disabled={!whisperXJsonExists || isTranscribing}
                              title={!whisperXJsonExists ? "无转录文件" : "删除 WhisperX 转录文件"}
                          >
                              删除转录
                          </button>
                      </div>
                  </div>
              </div>

              {/* Actions: Archive and Delete Task Button */}
              <div className="card-actions justify-end items-center mt-2 pt-2 border-t border-base-200/60"> 
                 {/* Archive Button */}
                 <button 
                     className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning ${task.archived ? 'btn-disabled text-base-content/30' : 'text-warning'} hover:bg-base-content/10 flex items-center justify-center`}
                     onClick={() => !task.archived && onArchive(task.uuid)} // Prevent archiving again
                     disabled={task.archived}
                     title={task.archived ? "任务已归档" : "归档任务(保留元数据,删除媒体)"}
                     data-tip={task.archived ? "已归档" : "归档"}
                 >
                   <FaArchive size="0.9em"/>
                 </button>
                 {/* Delete Button */}
                 <button 
                   className={`btn btn-ghost btn-xs btn-square text-error tooltip tooltip-error hover:bg-base-content/10 flex items-center justify-center`}
                   onClick={() => onDelete(task.uuid)}
                   title="删除整个任务" 
                   data-tip="删除任务" 
                 >
                   <FaTrash6 size="0.9em"/> 
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
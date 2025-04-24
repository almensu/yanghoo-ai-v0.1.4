import React from 'react';
// Import icons
import { FaVideo, FaVideoSlash, FaHeadphones, FaVolumeMute, FaTrash } from 'react-icons/fa';
// Import more intuitive icons
import { 
  FaFileVideo, FaVideoSlash as FaVideoSlash6, 
  FaFileAudio, FaVolumeXmark, 
  FaDownload, FaMusic, FaClosedCaptioning, FaLanguage, FaTrash as FaTrash6 
} from 'react-icons/fa6';  // Use fa6 version for updated icons
// Add FaArchive
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


function CardView({ tasks, onDelete, onArchive, onDownloadRequest, onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt, onDeleteVtt }) {
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
          <div key={task.uuid} className={`card bg-base-100 shadow-md border border-base-200/70 rounded-lg overflow-hidden relative ${task.archived ? 'opacity-60' : ''}`}>
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
            <div className={`card-body p-3 ${task.archived ? 'pointer-events-none' : ''}`}>
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
                    <button tabIndex={0} className="btn btn-ghost btn-xs btn-square tooltip tooltip-info hover:bg-base-content/10 flex items-center justify-center" data-tip="下载视频">
                      <FaDownload size="0.9em" className="text-info"/>
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
                  >
                    <FaTrash size="0.9em" /> 
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1 pt-2 border-t border-base-200/60">
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg ${audioExists ? 'text-accent' : 'text-base-content/40'}`}>
                    {audioExists ? <FaFileAudio /> : <FaVolumeXmark />}
                  </span>
                  <span className="text-xs font-medium">{audioExists ? "音频" : "无音频"}</span>
                </div>
                
                <div className="flex gap-0.5">
                  <button 
                    className={`btn btn-ghost btn-xs btn-square tooltip tooltip-accent hover:bg-base-content/10 flex items-center justify-center ${!videoExists ? 'btn-disabled text-base-content/30' : 'text-accent'}`}
                    onClick={() => onExtractAudio(task.uuid)}
                    disabled={!videoExists}
                    title={!videoExists ? "请先下载视频" : "从视频中提取音频"}
                  >
                    <FaMusic size="0.9em" />
                  </button>
                  
                  <button 
                    className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!audioExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                    onClick={() => onDeleteAudio(task.uuid)}
                    disabled={!audioExists}
                    title="删除音频文件"
                  >
                    <FaTrash size="0.9em" />
                  </button>
                </div>
              </div>
              
              {isYouTube && (
                <div className="mt-1 pt-2 border-t border-base-200/60">
                  <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-lg ${(vttEnExists || vttZhExists) ? 'text-info' : 'text-base-content/40'}`}>
                          <FaClosedCaptioning />
                      </span>
                      <span className="text-xs font-medium">字幕 (VTT)</span>
                       <button 
                           className={`btn btn-ghost btn-xs btn-square tooltip tooltip-info text-info hover:bg-base-content/10 flex items-center justify-center ml-auto ${!task.info_json_path ? 'btn-disabled text-base-content/30' : ''}`} 
                           onClick={() => onDownloadVtt(task.uuid)}
                           disabled={!task.info_json_path}
                           title={!task.info_json_path ? "需要先获取 Info JSON" : "下载可用 VTT (EN/ZH)"}
                           data-tip={!task.info_json_path ? "需要先获取 Info JSON" : "下载可用 VTT (EN/ZH)"}
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
                                  <FaTrash size="0.9em" /> 
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
                                  <FaTrash size="0.9em" />
                              </button>
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* Actions: Archive and Delete Task Button */}
              <div className="card-actions justify-end items-center mt-2 pt-2 border-t border-base-200/60"> 
                 {/* Archive Button - Disable if archived */}
                 <button 
                  className={`btn btn-ghost btn-xs btn-square text-primary tooltip tooltip-primary hover:bg-base-content/10 flex items-center justify-center ${task.archived ? 'btn-disabled text-base-content/30' : ''}`} 
                  onClick={() => onArchive(task.uuid)}
                  disabled={task.archived}
                  title="归档任务"
                  data-tip="归档任务"
                >
                  <FaArchive size="0.9em"/>
                </button>
                {/* Delete Button - Keep enabled? Or disable archived? For now, keep enabled */}
                <button 
                  className={`btn btn-ghost btn-xs btn-square text-error tooltip tooltip-error hover:bg-base-content/10 flex items-center justify-center ${task.archived ? '' : ''}`}
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
import React from 'react';
// Import icons
import { FaVideo, FaVideoSlash, FaHeadphones, FaVolumeMute, FaTrash } from 'react-icons/fa';
// Import more specific icons
import { FaFileVideo, FaFileAudio, FaVolumeXmark, FaDownload, FaMusic } from 'react-icons/fa6';
// Add FaClosedCaptioning and FaLanguage for VTT section
import { FaClosedCaptioning, FaLanguage, FaTrash as FaTrash6 } from 'react-icons/fa6';
// Add FaArchive for Archive button
import { FaArchive } from 'react-icons/fa';

// Basic placeholder for image loading/error (Could be shared in a utils file)
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000'; 
  const placeholder = "https://via.placeholder.com/40/eeeeee/999999?text=N/A"; // Smaller placeholder

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
     finalSrc = currentSrc;
  } else {
    // Otherwise, construct the backend URL
    // Strip "data/" prefix 
    const relativePath = currentSrc.startsWith('data/') ? currentSrc.substring(5) : currentSrc;
    finalSrc = `${backendUrl}/files/${relativePath}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};

// Update props to include VTT handlers
function TableView({ tasks, onDelete, onArchive, onDownloadRequest, onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt, onDeleteVtt }) {
  if (!tasks || tasks.length === 0) {
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];

  const hasVideo = (mediaFiles) => {
    return mediaFiles && typeof mediaFiles === 'object' && Object.values(mediaFiles).some(path => path !== null);
  };

  const hasAudio = (audioPath) => {
    return !!audioPath;
  };

  // Add the hasVtt helper function (similar to CardView)
  const hasVtt = (vttFiles, langCode) => {
    return vttFiles && typeof vttFiles === 'object' && !!vttFiles[langCode];
  };

  return (
    <div className="overflow-x-auto border border-base-200 rounded-lg">
      <table className="table w-full table-compact">
        <thead className="bg-base-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider"></th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">缩略图</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">标题</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">平台</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">URL</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">视频</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">音频</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">字幕 (VTT)</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-base-content uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-base-100 divide-y divide-base-200">
          {tasks.map((task, index) => {
            const videoExists = hasVideo(task.media_files);
            const audioExists = hasAudio(task.extracted_wav_path);
            // Check for specific VTT files and platform
            const isYouTube = task.platform === 'youtube';
            const vttEnExists = isYouTube && hasVtt(task.vtt_files, 'en');
            const vttZhExists = isYouTube && hasVtt(task.vtt_files, 'zh-Hans');

            return (
              <tr key={task.uuid} className={`hover ${task.archived ? 'opacity-60' : ''}`}>
                <th className={`py-2 px-4 align-middle ${task.archived ? 'pointer-events-none' : ''}`}>{index + 1}</th>
                <td className={`py-2 px-4 align-middle ${task.archived ? 'pointer-events-none' : ''}`}>
                  <div className="avatar">
                    <div className="w-10 h-10 rounded">
                      <ImageWithFallback 
                        src={task.thumbnail_path}
                        alt="Thumb"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </td>
                <td className={`py-2 px-4 align-middle ${task.archived ? 'pointer-events-none' : ''}`}>
                  <div className="font-medium line-clamp-2" title={task.title}>
                    {task.title || 'N/A'}
                    {task.archived && <span className="badge badge-warning badge-xs ml-2">Archived</span>}
                  </div>
                </td>
                <td className={`py-2 px-4 align-middle ${task.archived ? 'pointer-events-none' : ''}`}><span className="badge badge-ghost badge-sm font-normal">{task.platform}</span></td>
                <td className={`py-2 px-4 align-middle ${task.archived ? 'pointer-events-none' : ''}`}><a href={task.url} target="_blank" rel="noopener noreferrer" className="link link-hover text-xs truncate block max-w-[200px]" title={task.url}>{task.url}</a></td>
                <td className={`py-2 px-4 align-middle whitespace-nowrap ${task.archived ? 'pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`${videoExists ? 'text-success' : 'text-gray-400'}`}>
                      {videoExists ? <FaFileVideo size="1.1em"/> : <FaVideoSlash size="1.1em" />}
                    </span>
                    <span className="text-xs">
                      {videoExists ? "已下载" : "无视频"}
                    </span>

                    <div className="flex gap-1 ml-1">
                      <div className="dropdown dropdown-bottom">
                        <button tabIndex={0} className="btn btn-ghost btn-xs btn-square tooltip tooltip-info hover:bg-base-content/10 flex items-center justify-center" data-tip="下载视频">
                          <FaDownload size="0.9em" />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-1 shadow bg-base-200 rounded-box w-24 z-[1]">
                          {videoQualities.map(quality => (
                            <li key={quality} className="text-xs">
                              <a onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button 
                        className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!videoExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                        onClick={() => onDeleteVideo(task.uuid)}
                        disabled={!videoExists}
                        data-tip="删除视频"
                      >
                        <FaTrash size="0.9em" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className={`py-2 px-4 align-middle whitespace-nowrap ${task.archived ? 'pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`${audioExists ? 'text-accent' : 'text-gray-400'}`}>
                      {audioExists ? <FaFileAudio size="1.1em"/> : <FaVolumeXmark size="1.1em" />}
                    </span>
                    <span className="text-xs">
                      {audioExists ? "已提取" : "无音频"}
                    </span>

                    <div className="flex gap-1 ml-1">
                      <button 
                        className={`btn btn-ghost btn-xs btn-square tooltip tooltip-accent hover:bg-base-content/10 flex items-center justify-center ${!videoExists ? 'btn-disabled text-base-content/30' : 'text-accent'}`}
                        onClick={() => onExtractAudio(task.uuid)}
                        disabled={!videoExists}
                        data-tip={!videoExists ? "请先下载视频" : "提取音频"}
                      >
                        <FaMusic size="0.9em" />
                      </button>

                      <button 
                        className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!audioExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                        onClick={() => onDeleteAudio(task.uuid)}
                        disabled={!audioExists}
                        data-tip="删除音频"
                      >
                        <FaTrash size="0.9em" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className={`py-2 px-4 align-middle whitespace-nowrap ${task.archived ? 'pointer-events-none' : ''}`}>
                  {isYouTube ? (
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1 text-xs mb-0.5">
                         <span className={`text-base ${(vttEnExists || vttZhExists) ? 'text-info' : 'text-base-content/50'}`}><FaClosedCaptioning /></span>
                         <span className={`${(vttEnExists || vttZhExists) ? '' : 'text-base-content/70'}`}>{ (vttEnExists || vttZhExists) ? '可用' : '无' }</span>
                         {/* Single Download Button - Conditionally Disabled */}
                         <button 
                            className={`btn btn-ghost btn-xs btn-square tooltip tooltip-info text-info hover:bg-base-content/10 flex items-center justify-center ml-2 ${!task.info_json_path ? 'btn-disabled text-base-content/30' : ''}`} 
                            onClick={() => onDownloadVtt(task.uuid)}
                            disabled={!task.info_json_path}
                            data-tip={!task.info_json_path ? "需要先获取 Info JSON" : "下载可用 VTT (EN/ZH)"}
                        >
                           <FaDownload size="0.9em" />
                         </button>
                      </div>
                      {/* English VTT - Only Delete Button */}
                      <div className="flex items-center gap-1">
                         <FaLanguage size="0.9em" className="text-base-content/70"/> 
                         <span className={`text-xs w-8 ${vttEnExists ? 'font-medium' : 'text-base-content/70'}`}>英文</span>
                         {/* Delete Button Only */}
                         <button 
                            className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!vttEnExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                            onClick={() => onDeleteVtt(task.uuid, 'en')}
                            disabled={!vttEnExists}
                            data-tip="删除英文 VTT">
                           <FaTrash6 size="0.9em" />
                         </button>
                      </div>
                      {/* Chinese VTT - Only Delete Button */}
                      <div className="flex items-center gap-1">
                         <FaLanguage size="0.9em" className="text-base-content/70"/> 
                         <span className={`text-xs w-8 ${vttZhExists ? 'font-medium' : 'text-base-content/70'}`}>中文</span>
                         {/* Delete Button Only */}
                         <button 
                            className={`btn btn-ghost btn-xs btn-square tooltip tooltip-warning hover:bg-base-content/10 flex items-center justify-center ${!vttZhExists ? 'btn-disabled text-base-content/30' : 'text-warning'}`} 
                            onClick={() => onDeleteVtt(task.uuid, 'zh-Hans')}
                            disabled={!vttZhExists}
                            data-tip="删除中文 VTT">
                           <FaTrash6 size="0.9em" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/50">N/A</span>
                  )}
                </td>
                <td className="py-2 px-4 align-middle">
                  <div className="flex items-center gap-0.5">
                    <button 
                      className={`btn btn-ghost btn-xs btn-square tooltip tooltip-primary text-primary hover:bg-base-content/10 flex items-center justify-center ${task.archived ? 'btn-disabled text-base-content/30' : ''}`} 
                      onClick={() => onArchive(task.uuid)}
                      disabled={task.archived}
                      data-tip="归档任务"
                    >
                      <FaArchive size="0.9em"/>
                    </button>
                    <button 
                      className={`btn btn-ghost btn-xs btn-square tooltip tooltip-error text-error hover:bg-base-content/10 flex items-center justify-center ${task.archived ? '' : ''}`}
                      onClick={() => onDelete(task.uuid)}
                      data-tip="删除整个任务"
                    >
                      <FaTrash6 size="0.9em"/>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableView; 
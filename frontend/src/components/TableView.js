import React from 'react';
// Import icons
import { FaVideo, FaVideoSlash, FaHeadphones, FaVolumeMute, FaTrash } from 'react-icons/fa';
// Import more specific icons
import { FaFileVideo, FaFileAudio, FaVolumeXmark, FaDownload, FaMusic } from 'react-icons/fa6';

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

function TableView({ tasks, onDelete, onDownloadRequest, onExtractAudio, onDeleteVideo, onDeleteAudio }) {
  if (!tasks || tasks.length === 0) {
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];

  // Helper function to check if video exists (at least one non-null path)
  const hasVideo = (mediaFiles) => {
    return mediaFiles && typeof mediaFiles === 'object' && Object.values(mediaFiles).some(path => path !== null);
  };

  // Helper function to check if audio exists
  const hasAudio = (audioPath) => {
    return !!audioPath;
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra table-compact">
        {/* Head */}
        <thead>
          <tr>
            <th></th>
            <th>缩略图</th>
            <th>标题</th>
            <th>平台</th>
            <th>URL</th>
            <th>视频</th>
            <th>音频</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const videoExists = hasVideo(task.media_files);
            const audioExists = hasAudio(task.extracted_wav_path);

            return (
              <tr key={task.uuid} className="hover">
                <th>{index + 1}</th>
                <td>
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
                <td>
                  <div className="font-bold line-clamp-2" title={task.title}> 
                    {task.title || 'N/A'}
                  </div>
                </td>
                <td><span className="badge badge-ghost badge-sm">{task.platform}</span></td>
                <td><a href={task.url} target="_blank" rel="noopener noreferrer" className="link link-hover text-xs truncate block max-w-xs" title={task.url}>{task.url}</a></td>
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`${videoExists ? 'text-success' : 'text-gray-400'}`}>
                      {videoExists ? <FaFileVideo size="1.1em"/> : <FaVideoSlash size="1.1em" />}
                    </span>
                    <span className="text-xs">
                      {videoExists ? "已下载" : "无视频"}
                    </span>

                    <div className="flex gap-1 ml-1">
                      <div className="dropdown dropdown-bottom">
                        <button tabIndex={0} className="btn btn-success btn-xs btn-square btn-outline tooltip tooltip-success" data-tip="下载视频">
                          <FaDownload size="0.8em" />
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
                        className={`btn btn-xs btn-square btn-outline tooltip tooltip-warning ${!videoExists ? 'btn-disabled' : 'btn-warning'}`} 
                        onClick={() => onDeleteVideo(task.uuid)}
                        disabled={!videoExists}
                        data-tip="删除视频"
                      >
                        <FaTrash size="0.8em" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`${audioExists ? 'text-accent' : 'text-gray-400'}`}>
                      {audioExists ? <FaFileAudio size="1.1em"/> : <FaVolumeXmark size="1.1em" />}
                    </span>
                    <span className="text-xs">
                      {audioExists ? "已提取" : "无音频"}
                    </span>

                    <div className="flex gap-1 ml-1">
                      <button 
                        className={`btn btn-xs btn-square btn-outline tooltip tooltip-accent ${!videoExists ? 'btn-disabled' : 'btn-accent'}`}
                        onClick={() => onExtractAudio(task.uuid)}
                        disabled={!videoExists}
                        data-tip={!videoExists ? "请先下载视频" : "提取音频"}
                      >
                        <FaMusic size="0.8em" />
                      </button>

                      <button 
                        className={`btn btn-xs btn-square btn-outline tooltip tooltip-warning ${!audioExists ? 'btn-disabled' : 'btn-warning'}`} 
                        onClick={() => onDeleteAudio(task.uuid)}
                        disabled={!audioExists}
                        data-tip="删除音频"
                      >
                        <FaTrash size="0.8em" />
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn btn-error btn-xs btn-square tooltip tooltip-error" 
                    onClick={() => onDelete(task.uuid)}
                    data-tip="删除整个任务"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        {/* Foot */}
        <tfoot>
          <tr>
            <th></th> 
            <th>缩略图</th>
            <th>标题</th>
            <th>平台</th>
            <th>URL</th>
            <th>视频</th>
            <th>音频</th>
            <th>操作</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TableView; 
import React from 'react';
// Replace react-icons imports with lucide-react
import { 
  FileVideo, VideoOff, FileAudio, VolumeX, 
  Download, AudioWaveform, Captions, Languages, Trash2, 
  Headphones, Combine, Tv, Mic, Archive, Trash,
  ListVideo, ServerCrash, DownloadCloud, CheckCircle2, AlertCircle, XCircle, HelpCircle, MoreVertical,
  ChevronDown, Settings, FileText, ImageOff
} from 'lucide-react'; 

// Utility for conditional class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Icon wrapper for consistent styling
const IconWrapper = ({ icon: Icon, className, ...props }) => (
  <Icon className={cn("w-4 h-4", className)} {...props} />
);

// Updated ImageWithFallback to use Icon placeholder
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000';

  React.useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const onError = () => {
    if (!currentSrc) return; // Don't set error if src was initially empty
    setError(true);
  };

  let finalSrc = src;
  if (src && !src.startsWith('http') && !src.startsWith('data:')) {
    finalSrc = `${backendUrl}/files/${src}`;
  }

  if (error || !src) {
    // Render placeholder Icon if error or no src
    return (
      <div className={cn("flex items-center justify-center bg-base-200 h-full w-full", className)}> 
        <ImageOff className="w-1/2 h-1/2 text-base-content/30" strokeWidth={1} />
      </div>
    );
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};

function TableView({ 
  tasks, onDelete, onArchive, onDownloadRequest, onDownloadAudio, 
  onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt, 
  onDeleteVtt, onMergeVtt, onCreateVideo,
  onTranscribeWhisperX, onDeleteWhisperX,
  // Sorting props
  sortField,
  sortOrder,
  handleSort,
  SortIndicator
}) {
  const [whisperxModels, setWhisperxModels] = React.useState({});

  if (!tasks || tasks.length === 0) {
    return null; 
  }

  const videoQualities = ['best', '1080p', '720p', '360p'];
  const whisperXModelChoices = ['tiny.en', 'small.en', 'medium.en', 'large-v3'];

  const hasVideo = (mediaFiles) => mediaFiles && typeof mediaFiles === 'object' && Object.values(mediaFiles).some(path => path !== null);
  const hasAudio = (audioPath) => !!audioPath;
  const hasVtt = (vttFiles, langCode) => vttFiles && typeof vttFiles === 'object' && !!vttFiles[langCode];
  const isAudioPlatform = (platform) => ['xiaoyuzhou', 'podcast'].includes(platform);

  const canMergeVtt = (task) => {
    const vttEnExists = hasVtt(task.vtt_files, 'en');
    const vttZhExists = hasVtt(task.vtt_files, 'zh-Hans');
    return task.platform === 'youtube' && (vttEnExists || vttZhExists) && !task.merged_vtt_md_path;
  };

  const getSelectedWhisperXModel = (uuid) => whisperxModels[uuid] || 'medium.en';
  const handleWhisperXModelChange = (uuid, model) => setWhisperxModels(prev => ({ ...prev, [uuid]: model }));

  const renderSortIndicator = (field) => {
    if (sortField === field) {
      return <SortIndicator order={sortOrder} />;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto border border-base-300 rounded-lg shadow-sm">
      {/* Apply daisyUI table-zebra for Notion-like feel */}
      <table className="table w-full table-zebra table-compact">
        {/* Use slightly darker header */}
        <thead className="bg-base-200/70">
          <tr>
            {/* Adjust padding and text style */}
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">#</th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">缩略图</th>
            <th 
              className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider w-1/4 cursor-pointer hover:bg-base-300/50 transition-colors"
              onClick={() => handleSort('title')}
            >
              标题 {renderSortIndicator('title')}
            </th>
            <th 
              className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider cursor-pointer hover:bg-base-300/50 transition-colors"
              onClick={() => handleSort('platform')}
            >
              平台 {renderSortIndicator('platform')}
            </th>
            <th 
              className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider cursor-pointer hover:bg-base-300/50 transition-colors"
              onClick={() => handleSort('url')}
            >
              URL {renderSortIndicator('url')}
            </th>
            <th 
              className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider cursor-pointer hover:bg-base-300/50 transition-colors"
              onClick={() => handleSort('created_at')}
            >
              添加日期 {renderSortIndicator('created_at')}
            </th>
            <th 
              className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider cursor-pointer hover:bg-base-300/50 transition-colors"
              onClick={() => handleSort('last_modified')}
            >
              最后修改 {renderSortIndicator('last_modified')}
            </th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">视频</th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">音频</th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">VTT</th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">WhisperX</th>
            <th className="p-3 text-left text-xs font-semibold text-base-content/80 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-base-100 divide-y divide-base-200">
          {tasks.map((task, index) => {
            const videoExists = hasVideo(task.media_files);
            const audioExists = hasAudio(task.extracted_wav_path);
            const isYouTube = task.platform === 'youtube';
            const vttEnExists = isYouTube && hasVtt(task.vtt_files, 'en');
            const vttZhExists = isYouTube && hasVtt(task.vtt_files, 'zh-Hans');
            const audioDownloaded = !!task.downloaded_audio_path;
            const canDirectDownloadAudio = isAudioPlatform(task.platform);
            const canMerge = canMergeVtt(task);
            const isMerged = !!task.merged_vtt_md_path;
            const canCreatePodcastVideo = 
                (task.platform === 'xiaoyuzhou' || task.platform === 'podcast') && 
                !!task.thumbnail_path && 
                !!task.downloaded_audio_path && 
                !task.media_files?.best;
            const whisperXJsonExists = !!task.whisperx_json_path;
            const hasAudioForTranscription = audioExists || audioDownloaded;
            const selectedWhisperXModel = getSelectedWhisperXModel(task.uuid);
            const isTranscribing = false; // Placeholder

            return (
              // Ensure hover effect
              <tr key={task.uuid} className={`hover:bg-base-200/50 align-middle`}>
                <td className="p-3 text-xs text-base-content/70">{index + 1}</td>
                <td className="p-2">
                  <div className="avatar w-10 h-10 min-w-[2.5rem]"> {/* Ensure fixed size */}
                    <div className="w-10 h-10 rounded overflow-hidden">
                      <ImageWithFallback 
                        src={task.thumbnail_path}
                        alt="Thumb"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <div className="font-medium line-clamp-2" title={task.title}>
                    {task.title || 'N/A'}
                    {task.archived && <span className="badge badge-neutral badge-xs ml-2 font-normal">Archived</span>}
                  </div>
                </td>
                <td className="p-3 text-xs"><span className="badge badge-sm badge-outline font-normal">{task.platform || 'N/A'}</span></td>
                <td className="p-3 text-xs"><a href={task.url} target="_blank" rel="noopener noreferrer" className="link link-hover text-base-content/70 hover:text-primary truncate block max-w-[150px]" title={task.url}>{task.url || 'N/A'}</a></td>
                <td className="p-3 text-xs">
                  {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-3 text-xs">
                  {task.last_modified ? new Date(task.last_modified).toLocaleDateString() : 'N/A'}
                </td>
                {/* Video Column */} 
                <td className="p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <IconWrapper icon={videoExists ? FileVideo : VideoOff} className={cn(videoExists ? 'text-success' : 'text-base-content/40', 'flex-shrink-0')} />
                    <span className={cn(!videoExists && 'text-base-content/60', 'flex-shrink-0')}>{videoExists ? "有" : "无"}</span>
                    <div className="flex gap-1 ml-auto">
                       <div className="dropdown dropdown-bottom dropdown-end">
                         <button tabIndex={0} className="btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200" data-tip="下载视频">
                           <IconWrapper icon={Download} className="text-base-content/70"/>
                         </button>
                         <ul tabIndex={0} className="dropdown-content menu p-1 shadow bg-base-200 rounded-box w-24 z-[1]">
                           {videoQualities.map(quality => (
                             <li key={quality}><a className="text-xs" onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a></li>
                           ))}
                         </ul>
                       </div>
                       <button 
                         className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", !videoExists && "btn-disabled")} 
                         onClick={() => onDeleteVideo(task.uuid)}
                         disabled={!videoExists}
                         data-tip="删除视频文件"
                       >
                         <IconWrapper icon={Trash2} className="text-error/70"/>
                       </button>
                    </div>
                  </div>
                </td>
                
                {/* Audio Column */} 
                <td className="p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <IconWrapper 
                        icon={audioExists ? FileAudio : (audioDownloaded ? Headphones : VolumeX)} 
                        className={cn(
                            audioExists ? 'text-accent' : (audioDownloaded ? 'text-primary' : 'text-base-content/40'),
                            'flex-shrink-0'
                        )} 
                    />
                    <span className={cn(!(audioExists || audioDownloaded) && 'text-base-content/60', 'flex-shrink-0')}>
                       {audioExists ? "已提取" : (audioDownloaded ? "已下载" : "无")}
                    </span>
                    <div className="flex gap-1 ml-auto">
                        {canCreatePodcastVideo && (
                           <button 
                              className="btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200" 
                              onClick={() => onCreateVideo(task.uuid)}
                              data-tip="制作视频"
                            >
                              <IconWrapper icon={Tv} className="text-secondary" />
                           </button>
                        )}
                        {canDirectDownloadAudio && (
                           <button 
                              className={cn(
                                "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                (audioDownloaded || !task.info_json_path) && "btn-disabled"
                              )} 
                              onClick={() => onDownloadAudio(task.uuid)}
                              disabled={audioDownloaded || !task.info_json_path}
                              data-tip={audioDownloaded ? "音频已下载" : (!task.info_json_path ? "需获取 Info JSON" : "下载源音频")}
                            >
                              <IconWrapper icon={DownloadCloud} className={cn((audioDownloaded || !task.info_json_path) ? 'text-base-content/40' : 'text-primary')} />
                           </button>
                        )}
                       <button 
                         className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!videoExists || task.archived) && "btn-disabled")} 
                         onClick={() => onExtractAudio(task.uuid)}
                         disabled={!videoExists || task.archived}
                         data-tip="提取音频"
                       >
                         <IconWrapper icon={AudioWaveform} className={cn(!videoExists ? 'text-base-content/40' : 'text-accent')}/>
                       </button>
                       <button 
                         className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!(audioExists || audioDownloaded) || task.archived) && "btn-disabled")} 
                         onClick={() => onDeleteAudio(task.uuid)}
                         disabled={!(audioExists || audioDownloaded) || task.archived}
                         data-tip="删除音频文件"
                       >
                         <IconWrapper icon={Trash2} className="text-error/70"/>
                       </button>
                    </div>
                  </div>
                </td>
                
                {/* VTT Column */} 
                <td className="p-3 text-xs">
                  {isYouTube ? (
                    <div className="flex flex-col gap-1 items-start">
                      {/* Status and Actions */} 
                      <div className="flex items-center gap-1 w-full">
                         <IconWrapper icon={Captions} className={cn((vttEnExists || vttZhExists) ? 'text-info' : 'text-base-content/40')}/>
                         <span className={cn(!(vttEnExists || vttZhExists) && 'text-base-content/60', 'flex-grow')}>
                             {(vttEnExists || vttZhExists) ? (isMerged ? '已合并' : '可用') : '无'}
                         </span>
                         <button 
                            className={cn(
                                "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200 ml-1", 
                                (!canMerge || isMerged) && "btn-disabled"
                            )} 
                            onClick={() => onMergeVtt(task.uuid, 'all')}
                            disabled={!canMerge || isMerged}
                            data-tip={isMerged ? "字幕已合并" : (!canMerge ? (vttEnExists || vttZhExists ? "一键生成全部格式" : "缺少VTT文件") : "一键生成全部格式 (MD)")}
                          >
                            <IconWrapper icon={Combine} className={cn(isMerged ? 'text-success' : (!canMerge ? 'text-base-content/40' : 'text-secondary'))} /> 
                         </button>
                         <button 
                            className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!task.info_json_path || task.archived) && "btn-disabled")} 
                            onClick={() => onDownloadVtt(task.uuid)}
                            disabled={!task.info_json_path || task.archived}
                            data-tip="下载 VTT"
                        >
                           <IconWrapper icon={DownloadCloud} className={cn(!task.info_json_path ? 'text-base-content/40' : 'text-info')} />
                         </button>
                      </div>
                      {/* Language specifics */} 
                      <div className="pl-5 w-full space-y-0.5">
                          <div className="flex items-center gap-1">
                             <IconWrapper icon={Languages} className="w-3 h-3 text-base-content/50"/> 
                             <span className={cn(!vttEnExists && 'text-base-content/60', 'flex-grow')}>英文</span>
                             <button 
                                className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!vttEnExists || task.archived) && 'btn-disabled')} 
                                onClick={() => onDeleteVtt(task.uuid, 'en')}
                                disabled={!vttEnExists || task.archived}
                                data-tip="删除英文 VTT">
                               <IconWrapper icon={Trash} className="w-3 h-3 text-error/70"/>
                             </button>
                          </div>
                          <div className="flex items-center gap-1">
                             <IconWrapper icon={Languages} className="w-3 h-3 text-base-content/50"/> 
                             <span className={cn(!vttZhExists && 'text-base-content/60', 'flex-grow')}>中文</span>
                             <button 
                                className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!vttZhExists || task.archived) && 'btn-disabled')} 
                                onClick={() => onDeleteVtt(task.uuid, 'zh-Hans')}
                                disabled={!vttZhExists || task.archived}
                                data-tip="删除中文 VTT">
                               <IconWrapper icon={Trash} className="w-3 h-3 text-error/70"/>
                             </button>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-base-content/50 italic">N/A</span>
                  )}
                </td>
                
                {/* WhisperX Column */} 
                <td className="p-3 text-xs">
                  <div className="flex flex-col gap-1 items-start w-full max-w-[180px]">
                     {/* Status */} 
                     <div className="flex items-center gap-1 w-full">
                         <IconWrapper icon={Mic} className={cn(whisperXJsonExists ? 'text-success' : 'text-base-content/40')}/>
                         <span className={cn(!whisperXJsonExists && 'text-base-content/60', 'flex-grow')}>
                             {whisperXJsonExists ? `完成 (${task.transcription_model})` : '未转录'}
                         </span>
                         {isTranscribing && <span className="loading loading-spinner loading-xs text-primary ml-1"></span>}
                     </div>
                     {/* Model Select */} 
                     <select
                         className={cn("select select-bordered select-xs w-full font-normal", (!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived) && 'select-disabled opacity-60')}
                         value={selectedWhisperXModel}
                         onChange={(e) => handleWhisperXModelChange(task.uuid, e.target.value)}
                         disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived}
                         title={
                             task.archived ? "任务已归档" :
                             !hasAudioForTranscription ? "需音频" :
                             whisperXJsonExists ? "已转录" :
                             isTranscribing ? "转录中..." : "选择模型"
                         }
                     >
                         {whisperXModelChoices.map(model => (
                             <option key={model} value={model}>{model}</option>
                         ))}
                     </select>
                     {/* Action Buttons */} 
                     <div className="flex justify-end gap-1 w-full mt-0.5">
                          <button
                             className={cn("btn btn-outline btn-xs", whisperXJsonExists ? "btn-success" : "btn-primary", (!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived) && 'btn-disabled')}
                             onClick={() => onTranscribeWhisperX(task.uuid, selectedWhisperXModel)}
                             disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived}
                             title={ task.archived ? "任务已归档" : !hasAudioForTranscription ? "需要音频文件" : whisperXJsonExists ? "已转录" : isTranscribing ? "转录中..." : `使用 ${selectedWhisperXModel} 转录`}
                         >
                             {isTranscribing ? "..." : (whisperXJsonExists ? "已完成" : "开始")}
                         </button>
                         <button
                             className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", (!whisperXJsonExists || isTranscribing || task.archived) && 'btn-disabled')}
                             onClick={() => onDeleteWhisperX(task.uuid)}
                             disabled={!whisperXJsonExists || isTranscribing || task.archived}
                             data-tip="删除转录文件"
                         >
                            <IconWrapper icon={Trash2} className="text-error/70"/>
                         </button>
                     </div>
                  </div>
                </td>
                
                {/* Action Column */} 
                <td className="p-3 text-xs">
                  <div className="flex items-center gap-1">
                    <button 
                      className={cn("btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200")} 
                      onClick={() => onArchive(task.uuid)}
                      data-tip="归档/取消归档任务"
                    >
                      <IconWrapper icon={Archive} className="text-base-content/60"/>
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs btn-square tooltip text-error/70 hover:bg-error hover:text-error-content"
                      onClick={() => {
                        if (window.confirm('确定要删除这个任务吗？')) {
                          onDelete(task.uuid);
                        }
                      }}
                      data-tip="删除任务"
                    >
                      <IconWrapper icon={Trash2} />
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
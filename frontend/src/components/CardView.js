import React from 'react';
// Replace react-icons imports with lucide-react
import { 
  FileVideo, VideoOff, FileAudio, VolumeX, 
  Download, AudioWaveform, Captions, Languages, Trash2, 
  Headphones, Combine, Tv, Mic, Archive, 
  ListVideo, ServerCrash, DownloadCloud, CheckCircle2, AlertCircle, XCircle, HelpCircle, Trash, MoreVertical, 
  ChevronDown, Settings, FileText
} from 'lucide-react'; 

// Basic placeholder for image loading/error
const ImageWithFallback = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [error, setError] = React.useState(false);
  const backendUrl = 'http://127.0.0.1:8000';
  // Use a subtle placeholder or maybe just an icon
  const placeholder = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off"><path d="M8.1 8.1A15.4 15.4 0 0 1 12 3a15.4 15.4 0 0 1 3.9 5.1"/><path d="M17.7 17.7A15.4 15.4 0 0 1 12 21a15.4 15.4 0 0 1-5.7-3.3"/><path d="M3 3l18 18"/><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg>')}`;

  React.useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const onError = () => {
    if (!currentSrc || currentSrc !== placeholder) {
      setError(true);
    }
  };

  // Determine the final source URL
  let finalSrc;
  if (error || !currentSrc) {
    finalSrc = placeholder; // Use SVG placeholder on error or if src is empty
  } else if (currentSrc.startsWith('http') || currentSrc.startsWith('data:')) {
     finalSrc = currentSrc;
  } else {
    finalSrc = `${backendUrl}/files/${currentSrc}`;
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
};

// Utility for conditional class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Icon wrapper for consistent styling
const IconWrapper = ({ icon: Icon, className, ...props }) => (
  <Icon className={cn("w-4 h-4", className)} {...props} /> // Default size w-4 h-4
);

function CardView({
  tasks, onDelete, onArchive, onDownloadRequest, onDownloadAudio,
  onExtractAudio, onDeleteVideo, onDeleteAudio, onDownloadVtt,
  onDeleteVtt, onMergeVtt, onCreateVideo,
  onTranscribeWhisperX, onDeleteWhisperX
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
    return task.platform === 'youtube' && (vttEnExists || vttZhExists) && !task.merged_vtt_md_path && !task.archived;
  };

  const getSelectedWhisperXModel = (uuid) => whisperxModels[uuid] || 'medium.en';
  const handleWhisperXModelChange = (uuid, model) => setWhisperxModels(prev => ({ ...prev, [uuid]: model }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {tasks.map((task) => {
        const videoExists = hasVideo(task.media_files);
        const audioExists = hasAudio(task.extracted_wav_path);
        const audioDownloaded = !!task.downloaded_audio_path;
        const canDirectDownloadAudio = isAudioPlatform(task.platform);
        const vttEnExists = hasVtt(task.vtt_files, 'en');
        const vttZhExists = hasVtt(task.vtt_files, 'zh-Hans');
        const isYouTube = task.platform === 'youtube';
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
          // Use card-bordered and adjust padding/shadow
          <div key={task.uuid} className="card card-bordered bg-base-100 shadow-sm border-base-300 rounded-lg overflow-hidden relative group">
            {task.archived && (
              <span className="badge badge-neutral badge-sm absolute top-2 right-2 z-10 font-normal opacity-80">Archived</span>
            )}
             {/* Action buttons on hover */}
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                 <div className="tooltip" data-tip="归档任务">
                     <button 
                         className={cn(
                           "btn btn-square btn-xs btn-ghost text-base-content/60 hover:bg-base-200",
                           task.archived && "btn-disabled"
                         )}
                         onClick={() => !task.archived && onArchive(task.uuid)}
                         disabled={task.archived}
                     >
                       <IconWrapper icon={Archive}/>
                     </button>
                 </div>
                  <div className="tooltip" data-tip="删除任务">
                     <button 
                         className="btn btn-square btn-xs btn-ghost text-error/70 hover:bg-error hover:text-error-content"
                         onClick={() => onDelete(task.uuid)}
                     >
                       <IconWrapper icon={Trash2}/>
                     </button>
                  </div>
            </div>
            
            {/* Reduced height for thumbnail */}
            <figure className="h-40 overflow-hidden bg-base-200"> 
               <ImageWithFallback 
                 src={task.thumbnail_path}
                 alt={task.title || 'Thumbnail'} 
                 className="object-cover w-full h-full"
                />
            </figure>
            {/* Increased padding */}
            <div className="card-body p-4 space-y-3"> 
              {/* Title and URL */}
              <div>
                <h2 className="font-medium text-sm line-clamp-2 mb-0.5" title={task.title}>
                  {task.title || 'No Title'}
                </h2>
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-xs text-base-content/60 hover:text-primary truncate block" title={task.url}>{task.url || 'No URL'}</a>
              </div>
              
              {/* Platform Badge */}
              <div>
                 <span className="badge badge-sm badge-outline font-normal">{task.platform || 'N/A'}</span>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-base-200/60"> {/* Group sections */}
                  {/* Video Section */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs">
                      <IconWrapper icon={videoExists ? FileVideo : VideoOff} className={cn(videoExists ? 'text-success' : 'text-base-content/40')} />
                      <span className={cn(!videoExists && 'text-base-content/60')}>视频</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200" data-tip="下载视频" disabled={task.archived}>
                          <IconWrapper icon={Download} className="text-base-content/70"/>
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-32 z-[1]">
                          {videoQualities.map(quality => (
                            <li key={quality}><a className="text-xs" onClick={() => onDownloadRequest(task.uuid, quality)}>{quality}</a></li>
                          ))}
                        </ul>
                      </div>
                      <button 
                        className={cn(
                          "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", 
                          !videoExists && "btn-disabled"
                        )} 
                        onClick={() => onDeleteVideo(task.uuid)}
                        disabled={!videoExists || task.archived}
                        data-tip="删除视频文件"
                      >
                        <IconWrapper icon={Trash2} className="text-error/70"/> 
                      </button>
                    </div>
                  </div>
                  
                  {/* Audio Section */}
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2 text-xs">
                        <IconWrapper 
                            icon={audioExists ? FileAudio : (audioDownloaded ? Headphones : VolumeX)} 
                            className={cn(
                                audioExists ? 'text-accent' : (audioDownloaded ? 'text-primary' : 'text-base-content/40')
                            )} 
                        />
                       <span className={cn(!(audioExists || audioDownloaded) && 'text-base-content/60')}>
                           {audioExists ? "已提取" : (audioDownloaded ? "已下载" : "无音频")}
                       </span>
                    </div>
                     <div className="flex gap-1">
                        {canCreatePodcastVideo && (
                            <button 
                                className="btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200" 
                                onClick={() => onCreateVideo(task.uuid)}
                                data-tip="制作视频"
                                disabled={task.archived}
                            >
                                <IconWrapper icon={Tv} className="text-secondary" />
                            </button>
                        )}
                        {canDirectDownloadAudio && (
                            <button 
                                className={cn(
                                    "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                    (audioDownloaded || !task.info_json_path || task.archived) && "btn-disabled"
                                )} 
                                onClick={() => onDownloadAudio(task.uuid)}
                                disabled={audioDownloaded || !task.info_json_path || task.archived}
                                data-tip={audioDownloaded ? "音频已下载" : (!task.info_json_path ? "需获取 Info JSON" : "下载源音频")}
                            >
                                <IconWrapper icon={DownloadCloud} className={cn((audioDownloaded || !task.info_json_path) ? 'text-base-content/40' : 'text-primary')} />
                            </button>
                        )}
                        <button 
                           className={cn(
                               "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                               (!videoExists || task.archived) && "btn-disabled"
                           )} 
                           onClick={() => onExtractAudio(task.uuid)}
                           disabled={!videoExists || task.archived}
                           data-tip="提取音频"
                         >
                           <IconWrapper icon={AudioWaveform} className={cn(!videoExists ? 'text-base-content/40' : 'text-accent')}/>
                         </button>
                         <button 
                           className={cn(
                               "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                               (!(audioExists || audioDownloaded) || task.archived) && "btn-disabled"
                           )} 
                           onClick={() => onDeleteAudio(task.uuid)}
                           disabled={!(audioExists || audioDownloaded) || task.archived}
                           data-tip="删除音频文件"
                         >
                           <IconWrapper icon={Trash2} className="text-error/70"/>
                         </button>
                    </div>
                  </div>
                  
                  {/* VTT Section (YouTube only) */}
                  {isYouTube && (
                    <div className="pt-2 border-t border-base-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                               <IconWrapper icon={Captions} className={cn((vttEnExists || vttZhExists) ? 'text-info' : 'text-base-content/40')}/>
                               <span className={cn(!(vttEnExists || vttZhExists) && 'text-base-content/60')}>
                                   VTT 字幕 {isMerged ? '(已合并)' : ''}
                               </span>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                   className={cn(
                                       "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                       (!canMerge || task.archived) && "btn-disabled"
                                    )} 
                                   onClick={() => onMergeVtt(task.uuid)}
                                   disabled={!canMerge || task.archived}
                                   data-tip={isMerged ? "字幕已合并" : (!(vttEnExists || vttZhExists) ? "缺少字幕" : "合并字幕 (MD)")}
                                >
                                   <IconWrapper icon={Combine} className={cn(!canMerge ? 'text-base-content/40' : 'text-secondary')} /> 
                                </button>
                                <button 
                                   className={cn(
                                       "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                       (!task.info_json_path || task.archived) && "btn-disabled"
                                   )} 
                                   onClick={() => onDownloadVtt(task.uuid)}
                                   disabled={!task.info_json_path || task.archived}
                                   data-tip="下载 VTT"
                                >
                                   <IconWrapper icon={DownloadCloud} className={cn(!task.info_json_path ? 'text-base-content/40' : 'text-info')} />
                                </button>
                            </div>
                        </div>
                        {/* Language specifics */}
                        <div className="pl-6 space-y-1"> 
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-xs">
                                   <IconWrapper icon={Languages} className="text-base-content/50"/> 
                                   <span className={cn(!vttEnExists && 'text-base-content/60')}>英文</span>
                               </div>
                               <button 
                                   className={cn(
                                       "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                       (!vttEnExists || task.archived) && 'btn-disabled'
                                   )} 
                                   onClick={() => onDeleteVtt(task.uuid, 'en')}
                                   disabled={!vttEnExists || task.archived}
                                   data-tip="删除英文 VTT"
                               >
                                   <IconWrapper icon={Trash} className="w-3 h-3 text-error/70" /> 
                               </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-xs">
                                   <IconWrapper icon={Languages} className="text-base-content/50"/> 
                                   <span className={cn(!vttZhExists && 'text-base-content/60')}>中文</span>
                               </div>
                               <button 
                                   className={cn(
                                       "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200",
                                       (!vttZhExists || task.archived) && 'btn-disabled'
                                   )} 
                                   onClick={() => onDeleteVtt(task.uuid, 'zh-Hans')}
                                   disabled={!vttZhExists || task.archived}
                                   data-tip="删除中文 VTT"
                               >
                                   <IconWrapper icon={Trash} className="w-3 h-3 text-error/70" />
                               </button>
                            </div>
                        </div>
                    </div>
                  )}
                  
                  {/* WhisperX Section */}
                  <div className="pt-2 border-t border-base-200/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                         <IconWrapper icon={Mic} className={cn(whisperXJsonExists ? 'text-success' : 'text-base-content/40')}/>
                         <span className={cn(!whisperXJsonExists && 'text-base-content/60')}>
                            WhisperX 字幕
                            {whisperXJsonExists && <span className="font-normal text-success/80"> (已完成)</span>}
                            {whisperXJsonExists && task.transcription_model && ` (${task.transcription_model})`}
                         </span>
                         {isTranscribing && <span className="loading loading-spinner loading-xs text-primary ml-auto"></span>}
                      </div>
                     
                      <div className="flex flex-col gap-1.5">
                          <select
                             className={cn(
                                 "select select-bordered select-xs w-full font-normal",
                                 (!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived) && 'select-disabled opacity-60'
                             )}
                             value={selectedWhisperXModel}
                             onChange={(e) => handleWhisperXModelChange(task.uuid, e.target.value)}
                             disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived}
                             title={
                                task.archived ? "任务已归档" :
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
                                 className={cn(
                                     "btn btn-outline btn-xs", 
                                     whisperXJsonExists ? "btn-success" : "btn-primary",
                                     (!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived) && 'btn-disabled'
                                 )}
                                 onClick={() => onTranscribeWhisperX(task.uuid, selectedWhisperXModel)}
                                 disabled={!hasAudioForTranscription || whisperXJsonExists || isTranscribing || task.archived}
                                 title={
                                     task.archived ? "任务已归档" :
                                     !hasAudioForTranscription ? "需要音频文件" :
                                     whisperXJsonExists ? `已转录 (${task.transcription_model})` :
                                     isTranscribing ? "正在转录..." : `使用 ${selectedWhisperXModel} 模型转录`
                                 }
                             >
                                {isTranscribing ? "转录中..." : (whisperXJsonExists ? "已完成" : "开始转录")}
                             </button>
                             <button
                                 className={cn(
                                     "btn btn-ghost btn-xs btn-square tooltip hover:bg-base-200", 
                                     (!whisperXJsonExists || isTranscribing || task.archived) && 'btn-disabled'
                                 )}
                                 onClick={() => onDeleteWhisperX(task.uuid)}
                                 disabled={!whisperXJsonExists || isTranscribing || task.archived}
                                 data-tip="删除转录文件"
                             >
                                <IconWrapper icon={Trash2} className="text-error/70"/>
                             </button>
                          </div>
                      </div>
                  </div>
              </div> 
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CardView; 
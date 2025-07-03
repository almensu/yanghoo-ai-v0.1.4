import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { WebVTTParser } from 'webvtt-parser';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import VttPreviewer from './VttPreviewer';
import MarkdownViewer from './MarkdownViewer';
import MarkdownWithTimestamps from './MarkdownWithTimestamps';
import StudioWorkSpace from './StudioWorkSpace';
import AIChat from './AIChat';
import TimestampFormatTest from './TimestampFormatTest';
import KeyframeClipPanel from './KeyframeClipPanel';

// 视频任务选择器组件
function VideoTaskSelector({ apiBaseUrl, currentTaskUuid }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      if (response.status === 200) {
        // 筛选有视频的任务
        const tasksWithVideo = response.data.filter(task => 
          task.media_files && typeof task.media_files === 'object' && 
          Object.values(task.media_files).some(path => path !== null)
        );
        setTasks(tasksWithVideo);
      }
    } catch (error) {
      console.error("获取任务列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTask = (taskUuid) => {
    navigate(`/studio/${taskUuid}`);
    setIsOpen(false);
  };

  const filteredTasks = tasks.filter(task => 
    !searchTerm || 
    (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 缩略图失败时的后备图标
  const ThumbnailFallback = () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </div>
  );

  // 渲染缩略图组件
  const Thumbnail = ({ task }) => {
    const [imgError, setImgError] = useState(false);
    const thumbnailUrl = task.thumbnail_path 
      ? `${apiBaseUrl}/api/tasks/${task.uuid}/files/${task.thumbnail_path.split('/').pop()}`
      : null;

    if (!thumbnailUrl || imgError) {
      return <ThumbnailFallback />;
    }

    return (
      <img 
        src={thumbnailUrl}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-sm btn-outline flex items-center gap-1 h-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        切换视频
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">选择视频</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="搜索视频标题..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto flex-grow p-2">
              {isLoading ? (
                <div className="p-4 text-center">加载中...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "没有找到匹配的视频" : "没有可用的视频"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                  {filteredTasks.map(task => (
                    <div 
                      key={task.uuid}
                      onClick={() => handleSelectTask(task.uuid)}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-base-100 transition-colors
                        ${task.uuid === currentTaskUuid ? 'border-primary bg-primary/5' : 'border-gray-200'}
                      `}
                    >
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        <Thumbnail task={task} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2" title={task.title}>
                          {task.title || '无标题'}
                        </h4>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span className="badge badge-sm">{task.platform || 'N/A'}</span>
                          {task.created_at && (
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add scrollbar styling with !important to ensure they override other styles
const scrollbarStyles = `
  /* 全局滚动条样式 */
  * {
    scrollbar-width: thin !important;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent !important;
  }

  /* Hide scrollbar by default but allow scrolling */
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
    background: transparent !important;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent !important;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3) !important;
    border-radius: 4px !important;
    transition: background 0.2s ease !important;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6) !important;
  }

  /* Style for elements that should have custom scrollbar behavior */
  .custom-scrollbar {
    overflow: auto !important;
  }
  
  .custom-scrollbar:not(:hover)::-webkit-scrollbar-thumb {
    background: transparent !important;
  }
  
  .custom-scrollbar:not(:hover) {
    scrollbar-color: transparent transparent !important;
  }
  
  /* Target all scrolling containers */
  .overflow-auto::-webkit-scrollbar-thumb,
  .overflow-y-auto::-webkit-scrollbar-thumb,
  .overflow-x-auto::-webkit-scrollbar-thumb,
  div::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3) !important;
    border-radius: 4px !important;
  }
  
  .overflow-auto:not(:hover)::-webkit-scrollbar-thumb,
  .overflow-y-auto:not(:hover)::-webkit-scrollbar-thumb,
  .overflow-x-auto:not(:hover)::-webkit-scrollbar-thumb,
  div:not(:hover)::-webkit-scrollbar-thumb {
    background: transparent !important;
  }
`;

// --- 新增：前端 VTT 清洗辅助函数 ---

/**
 * 清洗单个 VTT cue 的文本内容。
 * - 移除所有 <...> 标签 (包括时间戳和自定义标签)
 * - 将换行符替换为空格
 * @param {string} text 原始 cue 文本
 * @returns {string} 清洗后的文本
 */
const cleanCueText = (text) => {
  if (!text) return '';
  // 移除所有 <...> 标签
  let cleanedText = text.replace(/<[^>]+>/g, '');
  // 将换行符替换为空格并去除首尾空格
  cleanedText = cleanedText.replace(/\n+/g, ' ').trim();
  return cleanedText;
};

/**
 * 对已解析的 VTT cues 数组进行去重叠/冗余处理。
 * 类似于 python 脚本中的 deduplicate_overlaps。
 * @param {Array<{startTime: number, endTime: number, text: string}>} cues 原始 cues 数组
 * @returns {Array<{startTime: number, endTime: number, text: string}>} 去重后的 cues 数组
 */
const deduplicateParsedCues = (cues) => {
  if (!cues || cues.length === 0) {
    return [];
  }

  const deduplicated = [cues[0]]; // 保留第一个 cue

  for (let i = 1; i < cues.length; i++) {
    const prevCue = deduplicated[deduplicated.length - 1];
    const currentCue = cues[i];

    // 检查文本是否有效以及是否以前一个文本开头（且不完全相同）
    if (prevCue.text && currentCue.text && 
        currentCue.text !== prevCue.text && 
        currentCue.text.startsWith(prevCue.text)) {
      // 移除重叠部分
      const newText = currentCue.text.substring(prevCue.text.length).trim();
      // 只有当移除重叠后仍有内容时才添加
      if (newText) {
        // 保留当前 cue 的时间戳，但使用新文本
        deduplicated.push({ ...currentCue, text: newText });
      } 
      // 如果移除后为空，则跳过这个 cue
    } else if (currentCue.text !== prevCue.text) {
       // 如果不重叠，且与前一个文本不同，则添加
      deduplicated.push(currentCue);
    }
    // 如果当前文本与前一个完全相同，则跳过
  }

  return deduplicated;
};

// --- End VTT 清洗辅助函数 ---

// --- Robust VTT Parsing Logic (imported from TestPage_VttPreviewer) ---
const parseVtt = (vttString, lang) => {
  if (!vttString || vttString.trim() === '') return { cues: [], error: null };

  let parser = new WebVTTParser();
  let parseError = null;
  let preprocessedVtt = vttString;

  // Function to simplify text cleaning
  const cleanText = (text) => String(text || '').replace(/\n/g, ' ').trim();

  // --- Step 1: Basic Preprocessing (Header, Blank Lines) ---
  try {
    if (!preprocessedVtt.trim().startsWith('WEBVTT')) {
      preprocessedVtt = 'WEBVTT\n\n' + preprocessedVtt;
      parseError = 'Prepended missing WEBVTT header.';
    }
    if (preprocessedVtt.startsWith('WEBVTT') && !/^WEBVTT([\r\n]{2,})/.test(preprocessedVtt)) {
      preprocessedVtt = preprocessedVtt.replace(/^WEBVTT([\r\n]?)/, 'WEBVTT\n\n');
      const msg = 'Added missing blank line after WEBVTT.';
      parseError = parseError ? `${parseError} ${msg}` : msg;
    }

    // Handle metadata lines properly and ensure blank lines between cues
    const lines = preprocessedVtt.split(/[\r\n]+/);
    const processedLines = [];
    let inHeader = true;
    let expectCue = false;
    const timestampRegex = /^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (i === 0 && trimmedLine === 'WEBVTT') {
        processedLines.push(line);
        continue;
      }

      if (inHeader) {
        if (trimmedLine === '') {
          if (processedLines[processedLines.length - 1]?.trim() !== '') {
            processedLines.push(''); // Ensure only one blank line after header/metadata
          }
          inHeader = false;
          expectCue = true;
        } else {
          processedLines.push(line); // Keep metadata line
        }
        continue;
      }

      // Now processing cues
      if (timestampRegex.test(trimmedLine)) {
        if (!expectCue && processedLines[processedLines.length - 1]?.trim() !== '') {
          processedLines.push(''); // Add missing blank line before timestamp
          const msg = 'Added missing blank line before cue.';
          parseError = parseError ? `${parseError} ${msg}` : msg;
        }
        processedLines.push(line);
        expectCue = false; // Expect text next
      } else if (trimmedLine !== '') {
        processedLines.push(line); // Cue text or settings
        expectCue = false;
      } else { // Blank line
        if (processedLines.length > 0 && processedLines[processedLines.length - 1]?.trim() !== '') {
           processedLines.push(''); // Keep a blank line if it separates cues
           expectCue = true; // Expect timestamp or identifier next
        } // Otherwise, ignore consecutive blank lines
      }
    }
    preprocessedVtt = processedLines.join('\n');

  } catch (preprocErr) {
    console.error(`VTT (${lang}) Preprocessing error:`, preprocErr);
    // Don't stop parsing, just note the error
    const msg = `Preprocessing failed: ${preprocErr.message}`; 
    parseError = parseError ? `${parseError} ${msg}` : msg;
  }

  // --- Step 2: Attempt Parsing with webvtt-parser ---
  try {
    console.log(`VTT (${lang}): Attempting standard parse...`);
    const tree = parser.parse(preprocessedVtt, 'metadata');

    if (tree.errors.length > 0) {
      const errorMessages = tree.errors.slice(0, 3).map(e => e.message || 'Unknown parser error').join(', ');
      const errorSuffix = tree.errors.length > 3 ? ` (and ${tree.errors.length - 3} more)` : '';
      const msg = `Parser Errors: ${errorMessages}${errorSuffix}`; 
      parseError = parseError ? `${parseError} ${msg}` : msg;
      console.warn(`VTT (${lang}) parsing encountered errors:`, parseError);
    }

    if (tree.cues.length > 0) {
      // Step 1: Clean individual cue text (remove tags, normalize spaces)
      const cleanedCues = tree.cues.map(cue => ({
        ...cue,
        text: cleanCueText(cue.text) // 使用新的清洗函数
      }));
      
      // Step 2: Deduplicate cues (handle overlaps/redundancy)
      const finalCues = deduplicateParsedCues(cleanedCues); // 使用新的去重函数
      
      // Filter out cues with empty text AFTER cleaning and deduplication
      const parsedWithoutIds = finalCues.filter(cue => cue.text);
      
      // --- ADD ID to each cue --- 
      const parsed = parsedWithoutIds.map((cue, index) => ({
          ...cue,
          id: `${lang}-cue-${index}` // Generate unique ID using lang and index
      }));
      // ------------------------
      
      console.log(`[parseVtt ${lang}] Parsed ${tree.cues.length} cues initially, ${cleanedCues.length} after cleaning, ${finalCues.length} after dedupe, ${parsed.length} final non-empty cues.`);
      
      // Check for common errors (e.g., all cues having identical timestamps - might indicate parsing failure)
      if (parsed.length > 1) {
          const firstStartTime = parsed[0].startTime;
          const allSameStart = parsed.every(cue => cue.startTime === firstStartTime);
          if (allSameStart) {
              console.warn(`[parseVtt ${lang}] Warning: All ${parsed.length} parsed cues have the same start time (${firstStartTime}). This might indicate a VTT parsing issue.`);
              // Optionally set parseError here if this is considered a critical error
              // parseError = `All cues have the same start time (${firstStartTime}), indicating a potential parsing error.`;
          }
      }

      return { cues: parsed, error: parseError };
    } else {
         const msg = 'Standard parser returned zero cues.';
         parseError = parseError ? `${parseError} ${msg}` : msg;
         console.warn(`VTT (${lang}) Warning: ${msg}`);
    }
    // If standard parsing yielded no valid cues, proceed to fallbacks

  } catch (err) {
    const msg = `Standard parse failed: ${err.message}`; 
    parseError = parseError ? `${parseError} ${msg}` : msg;
    console.error(`VTT (${lang}) ${msg}`);
    // Proceed to fallbacks
  }

  // --- Step 3: Fallback Parsing (Aggressive Simplification) ---
  try {
    console.warn(`VTT (${lang}): Attempting fallback parsing (simplification)...`);
    const simplifiedVtt = 'WEBVTT\n\n' +
      vttString.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.includes('-->') || (line !== '' && !line.startsWith('WEBVTT') && !line.startsWith('Kind:') && !line.startsWith('Language:')))
        .map(line => line.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/, '$1 --> $2')) // Ensure space around arrow
        .join('\n');

    const fallbackTree = parser.parse(simplifiedVtt, 'metadata');
    if (fallbackTree.cues.length > 0) {
      let fallbackParsed = fallbackTree.cues
        .filter(cue => cue && cue.startTime !== undefined && cue.endTime !== undefined && cue.startTime < cue.endTime)
        .map(cue => ({ startTime: cue.startTime, endTime: cue.endTime, text: cleanText(cue.text) }))
        .sort((a, b) => a.startTime - b.startTime);

      if (fallbackParsed.length > 0) {
        // Add ID to fallback cues
        fallbackParsed = fallbackParsed.map((cue, index) => ({
            ...cue,
            id: `${lang}-fallback-cue-${index}`
        }));

        const msg = `Fallback parsing successful, ${fallbackParsed.length} valid cues recovered.`;
        parseError = parseError ? `${parseError} ${msg}` : msg;
        console.log(`VTT (${lang}): ${msg}`);
        return { cues: fallbackParsed, error: parseError };
      } else {
          const msg = 'Fallback parser found cues, but they were filtered out.';
          parseError = parseError ? `${parseError} ${msg}` : msg;
          console.warn(`VTT (${lang}) Warning: ${msg}`);
      }
    } else {
         const msg = 'Fallback parser returned zero cues.';
         parseError = parseError ? `${parseError} ${msg}` : msg;
         console.warn(`VTT (${lang}) Warning: ${msg}`);
    }
  } catch (fallbackErr) {
    const msg = `Fallback parsing failed: ${fallbackErr.message}`; 
    parseError = parseError ? `${parseError} ${msg}` : msg;
    console.error(`VTT (${lang}) ${msg}`);
  }

  // --- Step 4: Manual Extraction (Last Resort) ---
  try {
    console.warn(`VTT (${lang}): Attempting manual extraction...`);
    let manualCues = [];
    const lines = vttString.split(/[\r\n]+/);
    let currentCue = null;
    const timestampRegex = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/; // Capture groups

    const timeStrToSeconds = (h, m, s, ms) => parseInt(h)*3600 + parseInt(m)*60 + parseInt(s) + parseInt(ms)/1000;

    for (const line of lines) {
      const match = line.match(timestampRegex);
      if (match) {
        if (currentCue) manualCues.push(currentCue); // Save previous cue
        try {
            const startTime = timeStrToSeconds(match[1], match[2], match[3], match[4]);
            const endTime = timeStrToSeconds(match[5], match[6], match[7], match[8]);
            if (startTime < endTime) { // Basic validation
                 currentCue = { startTime, endTime, text: '' };
            } else {
                 currentCue = null; // Invalid time range
            }
        } catch (timeErr) {
             console.error(`VTT (${lang}) Manual time parse error: ${timeErr} on line: ${line}`);
             currentCue = null;
        }
      } else if (currentCue && line.trim() !== '' && !line.trim().startsWith('NOTE')) {
        // Append text to the current cue
        currentCue.text += (currentCue.text ? ' ' : '') + line.trim();
      }
    }
    if (currentCue) manualCues.push(currentCue); // Add the last cue

    if (manualCues.length > 0) {
      // Sort and Add ID to manually extracted cues
      manualCues.sort((a,b) => a.startTime - b.startTime);
      manualCues = manualCues.map((cue, index) => ({
          ...cue,
          text: cleanText(cue.text), // Clean text one last time
          id: `${lang}-manual-cue-${index}`
      }));

      const msg = `Manual extraction successful, ${manualCues.length} cues recovered.`;
      parseError = parseError ? `${parseError} ${msg}` : msg;
      console.log(`VTT (${lang}): ${msg}`);
      return { cues: manualCues, error: parseError };
    }
     const msg = 'Manual extraction failed to find any cues.';
     parseError = parseError ? `${parseError} ${msg}` : msg;
     console.warn(`VTT (${lang}) Warning: ${msg}`);

  } catch (manualErr) {
    const msg = `Manual extraction failed: ${manualErr.message}`; 
    parseError = parseError ? `${parseError} ${msg}` : msg;
    console.error(`VTT (${lang}) ${msg}`);
  }

  // If all methods failed, return empty cues with accumulated errors
  console.error(`VTT (${lang}): All parsing methods failed.`);
  return { cues: [], error: parseError || 'Failed to parse VTT using all methods.' };
};
// --------------------------------------------------------------------

// --- NEW: SRT Parsing Functions ---

/**
 * Parse SRT subtitle format
 * @param {string} srtString - Raw SRT content
 * @param {string} lang - Language identifier for IDs
 * @returns {Object} - { cues: Array, error: string|null }
 */
const parseSrt = (srtString, lang) => {
  if (!srtString || srtString.trim() === '') return { cues: [], error: null };

  console.log(`[parseSrt ${lang}] Starting SRT parsing...`);
  
  try {
    const lines = srtString.trim().split(/\r?\n/);
    const cues = [];
    let currentCue = null;
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      
      // Skip empty lines
      if (!line) {
        lineIndex++;
        continue;
      }

      // Check if line is a sequence number
      if (/^\d+$/.test(line)) {
        // Save previous cue if exists
        if (currentCue && currentCue.text) {
          cues.push(currentCue);
        }
        
        // Start new cue
        currentCue = {
          id: `${lang}-srt-cue-${line}`,
          text: '',
          startTime: 0,
          endTime: 0
        };
        lineIndex++;
        continue;
      }

      // Check if line is a timestamp
      const timestampMatch = line.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
      if (timestampMatch && currentCue) {
        const [, startH, startM, startS, startMs, endH, endM, endS, endMs] = timestampMatch;
        currentCue.startTime = parseInt(startH) * 3600 + parseInt(startM) * 60 + parseInt(startS) + parseInt(startMs) / 1000;
        currentCue.endTime = parseInt(endH) * 3600 + parseInt(endM) * 60 + parseInt(endS) + parseInt(endMs) / 1000;
        lineIndex++;
        continue;
      }

      // Otherwise, it's subtitle text
      if (currentCue) {
        if (currentCue.text) {
          currentCue.text += '\n' + line;
        } else {
          currentCue.text = line;
        }
      }
      lineIndex++;
    }

    // Add the last cue
    if (currentCue && currentCue.text) {
      cues.push(currentCue);
    }

    console.log(`[parseSrt ${lang}] Parsed ${cues.length} SRT cues`);
    return { cues, error: null };

  } catch (error) {
    console.error(`[parseSrt ${lang}] Error parsing SRT:`, error);
    return { cues: [], error: `SRT parsing failed: ${error.message}` };
  }
};

/**
 * Detect SRT content type and parse accordingly
 * @param {string} srtString - Raw SRT content
 * @param {string} lang - Language identifier
 * @returns {Object} - { cues: Array, error: string|null, detectedType: string }
 */
const detectAndParseSrt = (srtString, lang) => {
  if (!srtString || srtString.trim() === '') {
    return { cues: [], error: null, detectedType: 'empty' };
  }

  console.log(`[detectAndParseSrt ${lang}] Analyzing SRT content...`);
  
  // First parse normally
  const { cues: rawCues, error } = parseSrt(srtString, lang);
  if (error || rawCues.length === 0) {
    return { cues: rawCues, error, detectedType: 'unknown' };
  }

  // Analyze the content to detect type
  const sampleSize = Math.min(20, rawCues.length); // Sample first 20 cues
  const sampleCues = rawCues.slice(0, sampleSize);
  
  let englishCount = 0;
  let chineseCount = 0;
  let bilingualPairs = 0;

  // Check for bilingual pattern (pairs of cues with same timestamp)
  for (let i = 0; i < sampleCues.length - 1; i++) {
    const current = sampleCues[i];
    const next = sampleCues[i + 1];
    
    // Check if consecutive cues have same timestamp (bilingual pattern)
    if (Math.abs(current.startTime - next.startTime) < 0.1 && 
        Math.abs(current.endTime - next.endTime) < 0.1) {
      
      // Check language of each
      const currentIsEnglish = /^[a-zA-Z0-9\s\[\].,!?'"()-]+$/.test(current.text.replace(/[^\w\s\[\].,!?'"()-]/g, ''));
      const nextIsChinese = /[\u4e00-\u9fff]/.test(next.text);
      
      if (currentIsEnglish && nextIsChinese) {
        bilingualPairs++;
      }
    }
    
    // Count language types
    if (/^[a-zA-Z0-9\s\[\].,!?'"()-]+$/.test(current.text.replace(/[^\w\s\[\].,!?'"()-]/g, ''))) {
      englishCount++;
    }
    if (/[\u4e00-\u9fff]/.test(current.text)) {
      chineseCount++;
    }
  }

  console.log(`[detectAndParseSrt ${lang}] Analysis: English=${englishCount}, Chinese=${chineseCount}, BilingualPairs=${bilingualPairs}`);

  // Determine type and process accordingly
  if (bilingualPairs > sampleSize * 0.3) { // If >30% are bilingual pairs
    console.log(`[detectAndParseSrt ${lang}] Detected bilingual SRT, merging pairs...`);
    
    // Merge bilingual pairs
    const mergedCues = [];
    for (let i = 0; i < rawCues.length - 1; i += 2) {
      const englishCue = rawCues[i];
      const chineseCue = rawCues[i + 1];
      
      // Verify they have similar timestamps
      if (chineseCue && 
          Math.abs(englishCue.startTime - chineseCue.startTime) < 0.1 && 
          Math.abs(englishCue.endTime - chineseCue.endTime) < 0.1) {
        
        mergedCues.push({
          id: `${lang}-bilingual-srt-${i/2}`,
          startTime: englishCue.startTime,
          endTime: englishCue.endTime,
          enText: englishCue.text,
          zhText: chineseCue.text,
          isBilingual: true
        });
      } else {
        // If not a pair, add as regular cue
        mergedCues.push({
          ...englishCue,
          isBilingual: false
        });
        if (chineseCue) {
          mergedCues.push({
            ...chineseCue,
            isBilingual: false
          });
        }
      }
    }
    
    // Handle odd number of cues
    if (rawCues.length % 2 === 1) {
      const lastCue = rawCues[rawCues.length - 1];
      mergedCues.push({
        ...lastCue,
        isBilingual: false
      });
    }
    
    console.log(`[detectAndParseSrt ${lang}] Merged ${rawCues.length} cues into ${mergedCues.length} bilingual cues`);
    return { cues: mergedCues, error, detectedType: 'bilingual' };
    
  } else if (chineseCount > englishCount) {
    console.log(`[detectAndParseSrt ${lang}] Detected Chinese SRT`);
    return { 
      cues: rawCues.map(cue => ({ ...cue, isBilingual: false })), 
      error, 
      detectedType: 'chinese' 
    };
  } else {
    console.log(`[detectAndParseSrt ${lang}] Detected English SRT`);
    return { 
      cues: rawCues.map(cue => ({ ...cue, isBilingual: false })), 
      error, 
      detectedType: 'english' 
    };
  }
};

// --- End SRT Parsing Functions ---

// --- NEW: Format Cues to VTT String (将处理后的 cues 转回 VTT 字符串) ---
const formatCuesToVttString = (cues) => {
  if (!cues || cues.length === 0) {
    return 'WEBVTT\n\n'; // Return a valid empty VTT (返回有效的空 VTT)
  }

  // 辅助函数：秒转 VTT 时间戳 (HH:MM:SS.mmm)
  const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    // .toISOString() 返回 YYYY-MM-DDTHH:mm:ss.sssZ, 我们取 HH:mm:ss.sss 部分
    const timeStr = date.toISOString().substr(11, 12);
    return timeStr;
  };

  let vttString = 'WEBVTT\n\n';

  cues.forEach((cue, index) => {
    // 基本验证 - 跳过无效时间或没有文本的 cue
    if (cue.startTime === undefined || cue.endTime === undefined || cue.startTime >= cue.endTime) {
        if (!cue.text && (!cue.isBilingual || (!cue.enText && !cue.zhText))) {
            console.warn("Skipping invalid cue during VTT string generation (生成 VTT 字符串时跳过无效 cue):", cue);
            return; // 跳过这个 cue
        }
    }

    const startTimeFormatted = formatTime(cue.startTime);
    const endTimeFormatted = formatTime(cue.endTime);

    // 添加 cue 标识符 (可选, 但推荐)
    vttString += `${index + 1}\n`;
    vttString += `${startTimeFormatted} --> ${endTimeFormatted}\n`;
    
    // 处理不同格式的字幕
    if (cue.isBilingual) {
      // 双语字幕特殊处理：英文优先
      let bilingualText = '';
      if (cue.enText) bilingualText += cue.enText;
      if (cue.enText && cue.zhText) bilingualText += '\n';
      if (cue.zhText) bilingualText += cue.zhText;
      
      vttString += `${bilingualText.trim()}\n\n`;
    } else if (cue.text) {
      // 单语字幕处理
      const hasNewlines = cue.text.includes('\n');
      
      if (hasNewlines) {
        // 对于已经包含换行的文本，保留内部换行
        vttString += `${cue.text.trim()}\n\n`;
      } else {
        // 对于单行文本，替换换行为空格
        vttString += `${cue.text.replace(/\n+/g, ' ').trim()}\n\n`;
      }
    }
  });

  return vttString;
};
// -------------------------------------

// --- NEW: Define a simple logger for the component (can be replaced with a more robust solution) ---
const logger = {
  info: (...args) => console.log("[Studio]", ...args),
  warn: (...args) => console.warn("[Studio]", ...args),
  error: (...args) => console.error("[Studio]", ...args),
};
// --------------------------------------------------------------------------------------------


// --- NEW: Define a simple logger for the component (can be replaced with a more robust solution) ---
// --------------------------------------------------------------------------------------------

// Props:
// - taskUuid: The UUID of the task to display in the studio.
// - apiBaseUrl: The base URL for the API.

function Studio({ taskUuid, apiBaseUrl }) {
  // 添加 navigate hook
  const navigate = useNavigate();
  
  // Refs
  const videoElementRef = useRef(null);

  // State for fetched data
  const [taskDetails, setTaskDetails] = useState(null);
  const [videoRelativePath, setVideoRelativePath] = useState(''); 
  const [embedUrl, setEmbedUrl] = useState(null); 
  const [markdownContent, setMarkdownContent] = useState('');

  // --- NEW: State for multiple VTTs ---
  const [availableLangs, setAvailableLangs] = useState([]); // e.g., ['en', 'zh-Hans']
  const [parsedCuesByLang, setParsedCuesByLang] = useState({}); // e.g., { en: [...], 'zh-Hans': [...] }
  const [vttErrors, setVttErrors] = useState({}); // Store errors per language
  const [displayLang, setDisplayLang] = useState('zh-Hans'); // Default display mode

  // State for video source preference
  const [preferLocalVideo, setPreferLocalVideo] = useState(true); 

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW State for the VTT Blob URL (用于原生字幕轨的 Blob URL 状态) ---
  const [vttBlobUrl, setVttBlobUrl] = useState(null);
  const currentBlobUrlRef = useRef(null); // 用于管理清理

  // --- NEW: State for selected cues --- 
  const [selectedCueIds, setSelectedCueIds] = useState(new Set());
  const [lastSelectedCueId, setLastSelectedCueId] = useState(null); // For shift-click

  // --- NEW: State for cutting job --- 
  const [cuttingJobId, setCuttingJobId] = useState(null);
  const [cuttingStatus, setCuttingStatus] = useState('idle'); // idle, processing, completed, failed
  const [cuttingMessage, setCuttingMessage] = useState('');
  const [cutOutputPath, setCutOutputPath] = useState(null);
  const pollingIntervalRef = useRef(null); // To store interval ID for cleanup

  // --- NEW: State for VTT Previewer mode --- 
  const [vttMode, setVttMode] = useState('preview'); // 'preview' or 'cut'
  
  // --- NEW: State for clip mode type ---
  const [clipModeType, setClipModeType] = useState('subtitle'); // 'subtitle' or 'keyframe'

  // Define subtitleLangToEmbed at the component scope level
  const [embeddingSubtitleLang, setEmbeddingSubtitleLang] = useState('none');
  
  // --- NEW: State for output format ---
  const [outputFormat, setOutputFormat] = useState('video'); // 'video' or 'wav'

  // --- NEW: State for subtitle optimization settings ---
  const [subtitleOptimization, setSubtitleOptimization] = useState({
    enabled: true,
    minDisplayTime: 1.5,
    maxGapForMerge: 0.5,
    minTextLengthForShort: 10
  });
  
  // --- Subtitle optimization panel state ---
  const [showOptimizationSettings, setShowOptimizationSettings] = useState(false);

  // --- Data Fetching Effect (数据获取 Effect - 修改以重置 Blob URL) ---
  useEffect(() => {
    // Reset state when UUID changes
    setTaskDetails(null);
    setVideoRelativePath('');
    setEmbedUrl(null);
    setMarkdownContent('');
    setAvailableLangs([]);
    setParsedCuesByLang({});
    setVttErrors({});
    setError(null);
    setIsLoading(true);

    // --- ADDED: Reset blob URL on new task load (加载新任务时重置 blob URL) ---
    if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
        setVttBlobUrl(null);
        console.log("Studio: Revoked previous VTT Blob URL on task change (任务切换, 已撤销旧 Blob URL).");
    }
    // ----------------------------------------------------------------------

    if (!taskUuid || !apiBaseUrl) {
      setError('Missing Task UUID or API Base URL');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
       // ... (Existing fetchData logic to get task details, VTTs, markdown) ...
       // Make sure this part successfully populates `parsedCuesByLang`
        let details = null; // Scope details outside try block
        try {
            // 1. Fetch Task Details first
            console.log(`Studio: Fetching task details for ${taskUuid}`);
            const detailsResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}`);
            details = detailsResponse.data;
            setTaskDetails(details);
            console.log("Studio: Task details loaded:", details);

            // --- Extract video path and embed url (Keep as is) ---
            let relativePath = '';
            const mediaFiles = details.media_files;
            if (typeof mediaFiles === 'string' && mediaFiles.trim() !== '') {
                relativePath = mediaFiles.trim();
            } else if (typeof mediaFiles === 'object' && mediaFiles !== null) {
                const prioritizedKeys = ['best', '1080p', '720p', '480p', '360p'];
                for (const key of prioritizedKeys) {
                    if (typeof mediaFiles[key] === 'string' && mediaFiles[key].trim() !== '') {
                        relativePath = mediaFiles[key].trim();
                        break;
                    }
                }
                if (!relativePath) {
                    for (const key in mediaFiles) {
                        if (Object.hasOwnProperty.call(mediaFiles, key) && typeof mediaFiles[key] === 'string' && mediaFiles[key].trim() !== '') {
                            relativePath = mediaFiles[key].trim();
                            break;
                        }
                    }
                }
            }
            setVideoRelativePath(relativePath);
            setEmbedUrl(details.embed_url || null);
            console.log(`Studio: Final video path state: '${relativePath}', Embed URL state: ${details.embed_url || null}`);
            // --------------------------------------------------------

            // --- 2. Fetch All Available Subtitles (VTT and SRT) and Markdown Concurrently --- 
            console.log("Studio: Fetching subtitles and Markdown...");
            const vttFilesToFetch = details.vtt_files || {};
            const vttLangCodes = Object.keys(vttFilesToFetch).filter(lang => vttFilesToFetch[lang]);
            
            // Detect SRT files - simplified approach: just look for any .srt file
            const srtFilesToFetch = {};
            
            // Try to find any SRT file using common patterns
            const possibleSrtNames = [
                // Try the specific pattern from your example first
                `(75)_73_Questions_With_Blake_Lively___Vogue_-_YouTube-zh-CN-dual-double.srt`,
                // Try common patterns
                `${taskUuid}.srt`,
                `transcript.srt`,
                `${taskUuid}_dual.srt`,
                `${taskUuid}_bilingual.srt`,
                `${taskUuid}_zh-CN-dual.srt`,
                `${taskUuid}_zh-CN-dual-double.srt`,
                // Try with title
                ...(details.title ? [
                    `${details.title.replace(/[^\w]/g, '_')}.srt`,
                    `${details.title.replace(/[^\w]/g, '_')}_dual.srt`,
                ] : []),
                // Try to find any SRT file in the directory
                "*.srt",
                "test.srt" // 添加我们刚才创建的测试文件
            ];



            console.log("Studio: Available subtitle files:", { vtt: vttLangCodes });

            // Create promises for VTT files
            const vttPromises = vttLangCodes.map(lang => {
                const vttFilePath = vttFilesToFetch[lang];
                const vttFilename = vttFilePath.split('/').pop();
                if (!vttFilename) {
                    console.error(`Studio: Could not extract filename from VTT path '${vttFilePath}' for lang ${lang}.`);
                    return Promise.resolve({ lang, type: 'vtt', status: 'rejected', reason: `Invalid VTT file path format for ${lang}` });
                }

                const vttFileUrl = `${apiBaseUrl}/api/tasks/${taskUuid}/files/${vttFilename}`;
                console.log(`Studio: Fetching VTT for ${lang} from ${vttFileUrl}`);
                return axios.get(vttFileUrl, { responseType: 'text' })
                    .then(response => ({ lang, type: 'vtt', status: 'fulfilled', data: response.data }))
                    .catch(err => ({ lang, type: 'vtt', status: 'rejected', reason: err.response?.data?.detail || err.message }));
            });

            // Create promise for SRT file if it exists
            const srtPromises = [];
            let srtData = null;
            let srtFileName = null;
            
            // Check if we already found and loaded SRT data during detection
            for (const filename of possibleSrtNames) {
                try {
                    console.log(`Studio: Trying to find SRT file: ${filename}`);
                    const checkResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${filename}`, { 
                        responseType: 'text',
                        timeout: 5000 // 5 second timeout
                    });
                    if (checkResponse.status === 200 && checkResponse.data) {
                        srtData = checkResponse.data;
                        srtFileName = filename;
                        console.log(`Studio: Found and loaded SRT file: ${filename}`);
                        break;
                    }
                } catch (e) {
                    console.log(`Studio: SRT file ${filename} not found:`, e.response?.status || e.message);
                    // File doesn't exist, continue
                }
            }
            
            // 如果通过预定义模式没有找到SRT文件，尝试通过列出文件API查找任何SRT文件
            if (!srtData) {
                try {
                    console.log(`Studio: Trying to find any SRT file by listing files`);
                    const filesResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`);
                    if (filesResponse.status === 200 && filesResponse.data) {
                        const srtFiles = filesResponse.data.filter(file => file.toLowerCase().endsWith('.srt'));
                        if (srtFiles.length > 0) {
                            // 优先使用test.srt，否则使用第一个找到的SRT文件
                            const targetSrtFile = srtFiles.includes('test.srt') ? 'test.srt' : srtFiles[0];
                            console.log(`Studio: Found SRT file in directory: ${targetSrtFile}`);
                            
                            const srtResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${targetSrtFile}`, {
                                responseType: 'text',
                                timeout: 5000
                            });
                            
                            if (srtResponse.status === 200 && srtResponse.data) {
                                srtData = srtResponse.data;
                                srtFileName = targetSrtFile;
                                console.log(`Studio: Successfully loaded SRT file: ${targetSrtFile}`);
                            }
                        }
                    }
                } catch (e) {
                    console.log(`Studio: Error finding SRT files by listing:`, e.response?.status || e.message);
                }
            }
            
            if (srtData && srtFileName) {
                srtPromises.push(
                    Promise.resolve({ lang: 'srt', type: 'srt', status: 'fulfilled', data: srtData })
                );
            }

            const subtitlePromises = [...vttPromises, ...srtPromises];

            const markdownPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/markdown/parallel`, { responseType: 'text' })
                .then(response => ({ status: 'fulfilled', data: response.data }))
                .catch(err => ({ status: 'rejected', reason: err.response?.data?.detail || err.message }));

            const allPromises = [...subtitlePromises, markdownPromise];
            const results = await Promise.allSettled(allPromises); // Use allSettled

            console.log("Studio: Subtitle and Markdown fetch results:", results);

            // --- Process Subtitle Results --- 
            const newParsedCues = {};
            const newVttErrors = {};
            const processedLangs = [];
            
            results.slice(0, subtitlePromises.length).forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
                    const rawContent = result.value.data;
                    const fileType = result.value.type;
                    const lang = result.value.lang;
                    
                    let cues, parsingError;
                    
                    if (fileType === 'vtt') {
                        const parseResult = parseVtt(rawContent, lang);
                        cues = parseResult.cues;
                        parsingError = parseResult.error;
                    } else if (fileType === 'srt') {
                        const parseResult = detectAndParseSrt(rawContent, 'srt');
                        cues = parseResult.cues;
                        parsingError = parseResult.error;
                        if (parseResult.detectedType) {
                            console.log(`Studio: SRT detected as ${parseResult.detectedType}`);
                        }
                    } else {
                        cues = [];
                        parsingError = `Unknown file type: ${fileType}`;
                    }
                    
                    newParsedCues[lang] = cues;
                    processedLangs.push(lang);
                    if (parsingError) {
                        console.warn(`Studio: ${fileType.toUpperCase()} parsing issues for ${lang}:`, parsingError);
                        newVttErrors[lang] = parsingError;
                    }
                    console.log(`Studio: ${fileType.toUpperCase()} for ${lang} loaded and parsed successfully (${cues.length} cues).`);
                } else {
                    const reason = result.status === 'fulfilled' ? result.value.reason : (result.reason || 'Unknown fetch error');
                    const fileType = result.status === 'fulfilled' ? result.value.type : 'unknown';
                    const lang = result.status === 'fulfilled' ? result.value.lang : 'unknown';
                    console.error(`Studio: Failed to fetch or process ${fileType.toUpperCase()} for ${lang}:`, reason);
                    newVttErrors[lang] = `Failed to load: ${reason}`;
                }
            });
            
            setAvailableLangs(processedLangs);
            setParsedCuesByLang(newParsedCues);
            setVttErrors(newVttErrors);
            console.log("Studio Debug: Processed subtitle results (字幕处理结果):", { parsedCuesByLang: newParsedCues, vttErrors: newVttErrors });

            // --- Process Markdown Result --- 
            const markdownResult = results[results.length - 1]; // Last result is markdown
            if (markdownResult.status === 'fulfilled' && markdownResult.value.status === 'fulfilled') {
                console.log("Studio: Fetched Markdown Content:", markdownResult.value.data?.substring(0, 100) + "..."); // Log first 100 chars
                setMarkdownContent(markdownResult.value.data);
                console.log("Studio: Markdown content loaded.");
            } else {
                const reason = markdownResult.status === 'fulfilled' ? markdownResult.value.reason : (markdownResult.reason || 'Unknown fetch error');
                console.error("Studio: Failed to load Markdown:", reason);
                setError(prev => prev ? `${prev} Failed to load Markdown.` : 'Failed to load Markdown.'); // Append or set error
                setMarkdownContent(''); // Explicitly set to empty string on error
            }

            // Set initial displayLang based on availability
            if (!displayLang || !processedLangs.includes(displayLang)) {
                if (processedLangs.includes('zh-Hans')) setDisplayLang('zh-Hans');
                else if (processedLangs.includes('en')) setDisplayLang('en');
                else if (processedLangs.includes('srt')) setDisplayLang('srt');
                else if (processedLangs.length > 0) setDisplayLang(processedLangs[0]);
                else setDisplayLang('none'); // No language available
            }

        } catch (err) {
            // Handle errors from initial task details fetch OR potential errors in the processing logic above
            console.error("Studio: Error during data fetching or processing:", err.response?.data || err.message || err);
            // If details failed to load, set a general error
            if (!details) {
                setError(err.response?.data?.detail || `An error occurred fetching task details: ${err.message}`);
            }
            // Clear all potentially inconsistent state
            setTaskDetails(null);
            setVideoRelativePath('');
            setEmbedUrl(null);
            setAvailableLangs([]);
            setParsedCuesByLang({});
            setVttErrors({});
            setMarkdownContent('');
        } finally {
            setIsLoading(false);
            console.log("Studio: Data fetching finished.");
        }
    };

    fetchData();

    // --- Cleanup on unmount (组件卸载时清理) ---
    return () => {
        if (currentBlobUrlRef.current) {
            URL.revokeObjectURL(currentBlobUrlRef.current);
            currentBlobUrlRef.current = null;
             console.log("Studio: Revoked VTT Blob URL on component unmount (组件卸载, 已撤销 Blob URL).");
        }
    }

  }, [taskUuid, apiBaseUrl]); // Remove displayLang dependency


  // --- NEW Effect to Create/Update Blob URL when Cues or Language Change (当 cues 或语言变化时, 创建/更新 Blob URL 的 Effect) ---
  useEffect(() => {
    // 1. Clean up previous blob URL (清理上一个 blob URL)
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
      console.log("Studio: Revoked previous VTT Blob URL before creating new one (创建前, 已撤销旧 Blob URL).");
    }

    let cuesToUse = [];
    let langForTrack = displayLang; // 默认使用当前选择的语言

    // 2. Handle single language vs bilingual (处理单语和双语模式)
    if (displayLang === 'bilingual') {
        const enCues = parsedCuesByLang['en'] || [];
        const zhCues = parsedCuesByLang['zh-Hans'] || [];
        if (!enCues.length && !zhCues.length) return [];

        // Create a unified timeline of all unique start and end times
        const timePoints = new Set();
        [...enCues, ...zhCues].forEach(cue => {
            timePoints.add(cue.startTime);
            timePoints.add(cue.endTime);
        });
        const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);

        const mergedCues = [];
        for (let i = 0; i < sortedTimePoints.length - 1; i++) {
            const segmentStart = sortedTimePoints[i];
            const segmentEnd = sortedTimePoints[i+1];
            const midPoint = segmentStart + (segmentEnd - segmentStart) / 2;

            if (segmentStart >= segmentEnd) continue; // Skip zero-duration segments

            // 优先使用英文字幕，即使没有完全对齐
            const activeEnCue = enCues.find(cue => midPoint >= cue.startTime && midPoint < cue.endTime);
            const activeZhCue = zhCues.find(cue => midPoint >= cue.startTime && midPoint < cue.endTime);

            if (activeEnCue || activeZhCue) {
                mergedCues.push({
                    id: `bilingual-merged-${segmentStart}-${segmentEnd}`,
                    startTime: segmentStart,
                    endTime: segmentEnd,
                    enText: activeEnCue?.text || null,
                    zhText: activeZhCue?.text || null,
                    isBilingual: true
                });
            }
        }
        cuesToUse = mergedCues;
        langForTrack = 'en'; // 使用英语作为默认语言代码
    } else if (parsedCuesByLang[displayLang]?.length > 0) {
        cuesToUse = parsedCuesByLang[displayLang];
        langForTrack = displayLang;
    } else {
        cuesToUse = [];
    }

    // 3. Generate VTT string and Blob URL if cues exist (如果存在 cues, 生成 VTT 字符串和 Blob URL)
    if (cuesToUse.length > 0) {
      try {
        console.log(`Studio: Generating VTT string for native track (为原生字幕轨生成 VTT 字符串): lang=${langForTrack}, cues=${cuesToUse.length}`);
        
        // Apply subtitle timing optimization before generating VTT string
        const optimizedCues = optimizeSubtitleTiming(cuesToUse);
        console.log(`Studio: Applied subtitle timing optimization: ${cuesToUse.length} -> ${optimizedCues.length} cues`);
        
        const vttString = formatCuesToVttString(optimizedCues);
        const blob = new Blob([vttString], { type: 'text/vtt' });
        const newBlobUrl = URL.createObjectURL(blob);
        currentBlobUrlRef.current = newBlobUrl; // Store for cleanup
        setVttBlobUrl(newBlobUrl); // Update state
        console.log(`Studio: Created VTT Blob URL for ${langForTrack}: ${newBlobUrl}`);
      } catch (e) {
        console.error("Studio: Error creating VTT Blob (创建 VTT Blob 出错):", e);
        setVttBlobUrl(null);
      }
    } else {
         console.log(`Studio: No cues available for native track language (原生字幕轨无可用 cues): ${langForTrack}`);
         setVttBlobUrl(null);
    }

  }, [parsedCuesByLang, displayLang, availableLangs, subtitleOptimization]); // Dependencies

  // --- NEW: Subtitle optimization function to handle short sentences ---
  const optimizeSubtitleTiming = useCallback((cues) => {
    if (!cues || cues.length === 0 || !subtitleOptimization.enabled) return cues;
    
    const MIN_DISPLAY_TIME = subtitleOptimization.minDisplayTime;
    const MAX_GAP_FOR_MERGE = subtitleOptimization.maxGapForMerge;
    const MIN_TEXT_LENGTH_FOR_SHORT = subtitleOptimization.minTextLengthForShort;
    
    const optimizedCues = [];
    
    for (let i = 0; i < cues.length; i++) {
      const currentCue = { ...cues[i] };
      const duration = currentCue.endTime - currentCue.startTime;
      
      // 获取当前字幕的文本长度
      let textLength = 0;
      if (currentCue.isBilingual) {
        textLength = (currentCue.enText || '').length + (currentCue.zhText || '').length;
      } else {
        textLength = (currentCue.text || '').length;
      }
      
      // 检查是否是短句且显示时间过短
      const isShortSentence = textLength < MIN_TEXT_LENGTH_FOR_SHORT;
      const isTooFast = duration < MIN_DISPLAY_TIME;
      
      if (isShortSentence && isTooFast) {
        // 尝试与下一个字幕合并（如果间隔很近）
        const nextCue = cues[i + 1];
        if (nextCue && (nextCue.startTime - currentCue.endTime) <= MAX_GAP_FOR_MERGE) {
          // 合并当前字幕和下一个字幕
          const mergedCue = {
            ...currentCue,
            endTime: Math.max(nextCue.endTime, currentCue.startTime + MIN_DISPLAY_TIME),
            id: `${currentCue.id}-merged-${nextCue.id}`
          };
          
          if (currentCue.isBilingual && nextCue.isBilingual) {
            // 双语字幕合并
            mergedCue.enText = [currentCue.enText, nextCue.enText].filter(Boolean).join(' ');
            mergedCue.zhText = [currentCue.zhText, nextCue.zhText].filter(Boolean).join(' ');
          } else if (currentCue.isBilingual) {
            // 当前是双语，下一个是单语
            mergedCue.enText = currentCue.enText;
            mergedCue.zhText = [currentCue.zhText, nextCue.text].filter(Boolean).join(' ');
          } else if (nextCue.isBilingual) {
            // 当前是单语，下一个是双语
            mergedCue.isBilingual = true;
            mergedCue.enText = nextCue.enText;
            mergedCue.zhText = [currentCue.text, nextCue.zhText].filter(Boolean).join(' ');
            delete mergedCue.text;
          } else {
            // 都是单语字幕
            mergedCue.text = [currentCue.text, nextCue.text].filter(Boolean).join(' ');
          }
          
          optimizedCues.push(mergedCue);
          i++; // 跳过下一个字幕，因为已经合并了
          continue;
        } else {
          // 无法合并，延长当前字幕的显示时间
          const nextCueStart = nextCue ? nextCue.startTime : currentCue.endTime + MIN_DISPLAY_TIME;
          currentCue.endTime = Math.min(
            nextCueStart - 0.1, // 留0.1秒间隔
            currentCue.startTime + MIN_DISPLAY_TIME
          );
        }
      }
      
      optimizedCues.push(currentCue);
    }
    
    console.log(`Studio: Optimized ${cues.length} cues to ${optimizedCues.length} cues`);
    return optimizedCues;
  }, [subtitleOptimization]);

  // --- Compute displayed cues for VttPreviewer (修改以确保 cue 有 ID) ---
  const displayedCues = useMemo(() => {
    console.log("Studio Debug: Computing displayed cues for lang (计算 VttPreviewer cues):", displayLang, "Raw parsed cues:", parsedCuesByLang);
    let cuesForDisplay = [];
    if (displayLang === 'bilingual') {
        const enCues = parsedCuesByLang['en'] || [];
        const zhCues = parsedCuesByLang['zh-Hans'] || [];
        if (!enCues.length && !zhCues.length) return [];

        // Create a unified timeline of all unique start and end times
        const timePoints = new Set();
        [...enCues, ...zhCues].forEach(cue => {
            timePoints.add(cue.startTime);
            timePoints.add(cue.endTime);
        });
        const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);

        const mergedCues = [];
        for (let i = 0; i < sortedTimePoints.length - 1; i++) {
            const segmentStart = sortedTimePoints[i];
            const segmentEnd = sortedTimePoints[i+1];
            const midPoint = segmentStart + (segmentEnd - segmentStart) / 2;

            if (segmentStart >= segmentEnd) continue; // Skip zero-duration segments

            // 优先使用英文字幕，即使没有完全对齐
            const activeEnCue = enCues.find(cue => midPoint >= cue.startTime && midPoint < cue.endTime);
            const activeZhCue = zhCues.find(cue => midPoint >= cue.startTime && midPoint < cue.endTime);

            if (activeEnCue || activeZhCue) {
                mergedCues.push({
                    id: `bilingual-merged-${segmentStart}-${segmentEnd}`,
                    startTime: segmentStart,
                    endTime: segmentEnd,
                    enText: activeEnCue?.text || null,
                    zhText: activeZhCue?.text || null,
                    isBilingual: true
                });
            }
        }
        cuesForDisplay = mergedCues;

    } else if (parsedCuesByLang[displayLang]?.length > 0) {
        // For SRT files, the cues might already be bilingual or regular
        const rawCues = parsedCuesByLang[displayLang];
        const cuesWithIds = rawCues.map((cue, index) => ({
             ...cue, 
             id: cue.id || `${displayLang}-cue-${index}`, // Fallback ID generation if missing
             // Keep the original isBilingual property from SRT parsing
        }));
        
        // Apply subtitle timing optimization for display
        cuesForDisplay = optimizeSubtitleTiming(cuesWithIds);
    } else {
        cuesForDisplay = [];
    }
    
    console.log("Studio Debug: Final displayed cues (after optimization):", cuesForDisplay.slice(0, 3)); // Log first 3 cues for debugging
    
    // Reset selection if displayed cues change significantly (e.g., language change)
    // Note: This might be too aggressive, consider if selection should persist across langs
    setSelectedCueIds(new Set()); 
    return cuesForDisplay;

  }, [displayLang, parsedCuesByLang, optimizeSubtitleTiming]);

  // --- NEW: Handler for selecting/deselecting cues ---
  const handleCueSelect = useCallback((cueId, isShiftClick = false) => {
    setSelectedCueIds(prevSelected => {
      const newSelection = new Set(prevSelected);
      const currentCues = displayedCues; // Get current cues for range selection

      if (isShiftClick && lastSelectedCueId && currentCues.length > 0) {
        const lastClickedIndex = currentCues.findIndex(cue => cue.id === lastSelectedCueId);
        const currentClickedIndex = currentCues.findIndex(cue => cue.id === cueId);

        if (lastClickedIndex !== -1 && currentClickedIndex !== -1) {
          const start = Math.min(lastClickedIndex, currentClickedIndex);
          const end = Math.max(lastClickedIndex, currentClickedIndex);
          let selectionChanged = false;
          // Determine if we are selecting or deselecting the range
          // If the current item is already selected, and shift is held, we might be starting a new range select or deselecting part of a range.
          // For simplicity, let's assume shift-click always aims to add to selection for now.
          // A more complex logic could check if the anchor or current is selected to toggle the range.
          const shouldSelectRange = true; // Simplified: always select the range with shift

          for (let i = start; i <= end; i++) {
            if (shouldSelectRange) {
              if (!newSelection.has(currentCues[i].id)) {
                newSelection.add(currentCues[i].id);
                selectionChanged = true;
              }
            } else {
              if (newSelection.has(currentCues[i].id)) {
                newSelection.delete(currentCues[i].id);
                selectionChanged = true;
              }
            }
          }
          // If no actual change to selection in the range (e.g. all were already selected),
          // then toggle the current cueId to ensure a click always has an effect.
          if (!selectionChanged) {
            if (newSelection.has(cueId)) {
              newSelection.delete(cueId);
            } else {
              newSelection.add(cueId);
            }
          }
        } else {
          // Fallback if indices not found (should not happen with valid IDs)
          if (newSelection.has(cueId)) {
            newSelection.delete(cueId);
          } else {
            newSelection.add(cueId);
          }
        }
      } else {
        // Standard single click behavior
        if (newSelection.has(cueId)) {
          newSelection.delete(cueId);
        } else {
          newSelection.add(cueId);
        }
      }
      return newSelection;
    });

    // Update lastSelectedCueId only on non-shift clicks, 
    // or if it's the first click in a potential shift-click sequence.
    if (!isShiftClick || !lastSelectedCueId) {
      setLastSelectedCueId(cueId);
    }
    // If it IS a shift click, we don't change the anchor point (lastSelectedCueId)
    // because the user might want to expand the selection from the same anchor.

  }, [displayedCues, lastSelectedCueId]);

  // --- NEW: Batch selection handlers ---
  const handleSelectAll = useCallback(() => {
    const allCueIds = displayedCues.map(cue => cue.id);
    setSelectedCueIds(new Set(allCueIds));
  }, [displayedCues]);

  const handleSelectNone = useCallback(() => {
    setSelectedCueIds(new Set());
  }, []);

  // --- NEW: Select range of cues (by time) ---
  const handleSelectTimeRange = useCallback((startSeconds, endSeconds) => {
    if (startSeconds >= endSeconds) return;
    
    const cuesInRange = displayedCues.filter(
      cue => cue.startTime >= startSeconds && cue.endTime <= endSeconds
    );
    
    setSelectedCueIds(prevSelected => {
      const newSelection = new Set(prevSelected);
      cuesInRange.forEach(cue => newSelection.add(cue.id));
      return newSelection;
    });
  }, [displayedCues]);

  // --- Function to poll cut job status ---
  const pollCutStatus = useCallback((jobId, currentTaskUuid) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${currentTaskUuid}/cut/${jobId}/status`);
        const { status, message, output_path } = response.data;
        
        setCuttingStatus(status);
        setCuttingMessage(message || '');

        if (status === 'completed') {
          setCutOutputPath(output_path);
          setCuttingMessage(message || '剪辑完成！');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          logger.info(`Cut job ${jobId} completed. Output: ${output_path}`);
        } else if (status === 'failed') {
          setCutOutputPath(null);
          setCuttingMessage(message || '剪辑失败。');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          logger.error(`Cut job ${jobId} failed: ${message}`);
        } else {
          // Still processing or pending
          setCuttingMessage(message || '任务处理中...');
        }
      } catch (error) {
        logger.error(`Error polling cut status for job ${jobId}:`, error);
        setCuttingStatus('failed');
        setCuttingMessage('轮询剪辑状态失败: ' + (error.response?.data?.detail || error.message));
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 3000); // Poll every 3 seconds
  }, [apiBaseUrl]);

  // --- Cleanup polling on component unmount or when taskUuid changes ---
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        logger.info("Cleared cutting job polling interval on unmount/task change.");
      }
    };
  }, [taskUuid]); // Rerun cleanup if taskUuid changes

  // --- MODIFIED: Handler for the 'Cut Video' button ---
  const handleCutVideoClick = useCallback(async () => {
    if (cuttingStatus === 'processing') return; // Prevent multiple clicks during processing
    if (selectedCueIds.size === 0) {
      alert('请先选择需要保留的字幕片段');
      return;
    }

    const segmentsToKeep = Array.from(selectedCueIds)
      .map(id => displayedCues.find(cue => cue.id === id))
      .filter(Boolean)
      .map(cue => ({ start: cue.startTime, end: cue.endTime }))
      .sort((a, b) => a.start - b.start);

    // 检测连续片段并给用户提示
    const detectContinuousSegments = (segments) => {
      if (segments.length <= 1) return { isContinuous: true, gaps: [] };
      
      const gaps = [];
      for (let i = 1; i < segments.length; i++) {
        const gap = segments[i].start - segments[i-1].end;
        gaps.push(gap);
      }
      
      const maxGap = Math.max(...gaps);
      const isContinuous = maxGap <= 2.0; // 与后端的max_gap保持一致
      
      return { isContinuous, gaps, maxGap };
    };

    const { isContinuous, maxGap } = detectContinuousSegments(segmentsToKeep);
    
    if (isContinuous && segmentsToKeep.length > 1) {
      logger.info(`检测到连续片段 (最大间隔: ${maxGap?.toFixed(2)}s)，将自动合并以获得更流畅的输出`);
    }

    // Determine subtitle embedding language based on current displayLang in 'cut' mode
    let subtitleLangToEmbed = 'none'; // Default to no subtitles
    let subtitleType = 'vtt'; // Default to VTT
    
    if (vttMode === 'cut') {
      // Check if we have ASS files available - prioritize ASS files
      const hasAssFiles = taskDetails?.ass_files && Object.keys(taskDetails.ass_files).some(key => taskDetails.ass_files[key]);
      
      if (hasAssFiles) {
        // If we have ASS files, use them
        subtitleLangToEmbed = 'ass';
        subtitleType = 'ass';
        logger.info("Using ASS files for subtitle embedding");
      } else if (displayLang === 'srt' && parsedCuesByLang['srt']?.length > 0) {
        // Check if we're using SRT
        subtitleLangToEmbed = 'srt';
        subtitleType = 'srt';
      } else {
        // VTT logic
        if (displayLang === 'bilingual') {
          // 若选择双语，检查是否有足够的字幕数据
          if (parsedCuesByLang['en']?.length > 0 && parsedCuesByLang['zh-Hans']?.length > 0) {
            subtitleLangToEmbed = 'bilingual';
          } 
          // 降级到任一可用语言
          else if (parsedCuesByLang['zh-Hans']?.length > 0) {
            subtitleLangToEmbed = 'zh-Hans';
          }
          else if (parsedCuesByLang['en']?.length > 0) {
            subtitleLangToEmbed = 'en';
          }
        } else if (displayLang === 'en' && parsedCuesByLang['en']?.length > 0) {
          subtitleLangToEmbed = 'en';
        } else if (displayLang === 'zh-Hans' && parsedCuesByLang['zh-Hans']?.length > 0) {
          subtitleLangToEmbed = 'zh-Hans';
        }
        
        // 如果没有找到匹配的字幕，尝试选择任何可用的字幕
        if (subtitleLangToEmbed === 'none') {
          if (parsedCuesByLang['zh-Hans']?.length > 0) {
            subtitleLangToEmbed = 'zh-Hans';
          } else if (parsedCuesByLang['en']?.length > 0) {
            subtitleLangToEmbed = 'en';
          }
        }
      }
    }
    
    // Update state for the UI indicator
    setEmbeddingSubtitleLang(subtitleLangToEmbed);
    
    logger.info("--- Initiating Video Cut ---");
    logger.info("Task UUID:", taskUuid);
    logger.info("Video Identifier (for backend):", videoRelativePath);
    logger.info("Selected Segments (sec):", segmentsToKeep);
    logger.info("Subtitle Embedding Language:", subtitleLangToEmbed);
    logger.info("Subtitle Type:", subtitleType);

    setCuttingStatus('processing');
    setCuttingMessage('正在提交剪辑任务...');

    try {
      const response = await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/cut`, {
        media_identifier: videoRelativePath, 
        segments: segmentsToKeep,
        embed_subtitle_lang: subtitleLangToEmbed, // New parameter for backend
        subtitle_type: subtitleType, // Add subtitle type information
        output_format: outputFormat // 添加输出格式参数
      });

      const { job_id, message } = response.data;
      setCuttingJobId(job_id);
      setCuttingMessage(message || '剪辑任务已提交，正在处理...');
      logger.info(`Cut job submitted. Job ID: ${job_id}, Message: ${message}`);
      
      // Start polling for status
      pollCutStatus(job_id, taskUuid);

    } catch (error) {
      logger.error("Error sending cut request:", error.response?.data || error.message);
      setCuttingStatus('failed');
      setCuttingMessage('提交剪辑请求失败: ' + (error.response?.data?.detail || error.message));
      setCutOutputPath(null);
    }
  }, [selectedCueIds, displayedCues, taskUuid, videoRelativePath, apiBaseUrl, cuttingStatus, pollCutStatus, vttMode, displayLang, parsedCuesByLang, outputFormat]);

  // --- Handler to toggle VTT mode ---
  const toggleVttMode = (newMode) => {
    if (vttMode === newMode) return; // No change
    setVttMode(newMode);
    if (newMode === 'preview') {
      // Optionally reset selection and cutting status when switching to preview
      setSelectedCueIds(new Set());
      // If a cut job is active and user switches mode, what should happen?
      // For now, let's not reset cuttingJobId/Status, user might want to see it.
      // setCuttingJobId(null);
      // setCuttingStatus('idle');
      // setCuttingMessage('');
      // setCutOutputPath(null);
      // if (pollingIntervalRef.current) {
      //   clearInterval(pollingIntervalRef.current);
      //   pollingIntervalRef.current = null;
      // }
      logger.info("Switched to VTT Preview mode.");
    } else {
      logger.info("Switched to VTT Cut/Selection mode.");
    }
  };

  // --- Handler to toggle clip mode type ---
  const toggleClipModeType = (newType) => {
    if (clipModeType === newType) return; // No change
    setClipModeType(newType);
    // Reset any existing selections when switching between subtitle and keyframe clipping
    setSelectedCueIds(new Set());
    
    // Reset cutting status when switching modes
    if (newType === 'keyframe') {
      // Keep cutting status if switching to keyframe mode
    } else {
      // Reset cutting status if switching to subtitle mode
      setCuttingJobId(null);
      setCuttingStatus('idle');
      setCuttingMessage('');
      setCutOutputPath(null);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    
    logger.info(`Switched to ${newType} clipping mode.`);
  };

  // --- Handler for keyframe-based video clipping ---
  const handleKeyframeClipSegments = async (segments) => {
    if (!segments || segments.length === 0) {
      console.warn('No segments provided for keyframe clipping');
      return;
    }

    try {
      setCuttingStatus('processing');
      setCuttingMessage('');
      
      // Convert keyframe segments to the format expected by the cut API
      const cutSegments = segments.map(segment => ({
        start: segment.start,
        end: segment.end
      }));

      // Find a suitable media file for cutting
      let mediaIdentifier = '';
      const mediaFiles = taskDetails.media_files;
      if (typeof mediaFiles === 'string' && mediaFiles.trim() !== '') {
        mediaIdentifier = mediaFiles.trim();
      } else if (typeof mediaFiles === 'object' && mediaFiles !== null) {
        // Use the same priority logic as the video player
        const prioritizedKeys = ['best', '1080p', '720p', '480p', '360p'];
        for (const key of prioritizedKeys) {
          if (typeof mediaFiles[key] === 'string' && mediaFiles[key].trim() !== '') {
            mediaIdentifier = mediaFiles[key].trim();
            break;
          }
        }
        if (!mediaIdentifier) {
          for (const key in mediaFiles) {
            if (Object.hasOwnProperty.call(mediaFiles, key) && typeof mediaFiles[key] === 'string' && mediaFiles[key].trim() !== '') {
              mediaIdentifier = mediaFiles[key].trim();
              break;
            }
          }
        }
      }

      if (!mediaIdentifier) {
        throw new Error('No media file found for cutting');
      }

      const cutRequest = {
        media_identifier: mediaIdentifier,
        segments: cutSegments,
        embed_subtitle_lang: 'none', // Keyframe clipping typically doesn't need subtitles
        subtitle_type: 'vtt',
        output_format: outputFormat
      };

      console.log('Starting keyframe-based video cut with request:', cutRequest);

      const response = await axios.post(
        `${apiBaseUrl}/api/tasks/${taskUuid}/cut`,
        cutRequest,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 202 && response.data.job_id) {
        setCuttingJobId(response.data.job_id);
        setCuttingMessage(response.data.message || 'Cut job started');
        console.log('Keyframe cut job started:', response.data);
        
        // Start polling for status
        pollCutStatus(response.data.job_id, taskUuid);
      } else {
        throw new Error(response.data.message || 'Unexpected response from cut API');
      }
    } catch (error) {
      console.error('Keyframe cutting failed:', error);
      setCuttingStatus('failed');
      setCuttingMessage(error.response?.data?.detail || error.message || 'Unknown error during keyframe cutting');
    }
  };

  // Reset selection and last clicked cue when language or VTT mode changes significantly
  useEffect(() => {
    setSelectedCueIds(new Set());
    setLastSelectedCueId(null);
  }, [displayLang, vttMode]);

  // Add global scrollbar styles to head
  useEffect(() => {
    // 添加样式到head
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(scrollbarStyles));
    document.head.appendChild(styleElement);
    
    // 组件卸载时清理
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Add this in the UI section where the cut button is
  const getSubtitleLangLabel = (lang) => {
    switch(lang) {
      case 'bilingual': return '中英双语';
      case 'en': return 'English';
      case 'zh-Hans': return '中文';
      case 'ass': return 'ASS字幕';
      case 'srt': return 'SRT字幕';
      default: return '无字幕';
    }
  };

  // --- Render Logic ---
  if (isLoading) {
      return <div className="p-4 text-center flex-grow flex items-center justify-center">Loading Studio...</div>;
  }
  if (!taskUuid) {
      return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">Please select a task to view in Studio.</div>;
  }
  if (error && !taskDetails) {
      return <div className="p-4 text-center text-red-500 flex-grow flex items-center justify-center">Error: {error}</div>;
  }
  if (!taskDetails) {
      return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">No task details could be loaded.</div>;
  }

  const localVideoAvailable = Boolean(videoRelativePath);
  const embedVideoAvailable = Boolean(embedUrl);
  const allowToggle = true;
  const canToggleVideo = localVideoAvailable && embedVideoAvailable && allowToggle;

  const handleToggleVideo = () => {
    if (canToggleVideo) {
      setPreferLocalVideo(!preferLocalVideo);
    }
  };

  const localVideoSrc = videoRelativePath
    ? `${apiBaseUrl}/api/tasks/${taskUuid}/files/${videoRelativePath}`
    : null;

  // Determine language code for the track element (为 track 元素确定语言代码)
  let actualTrackLang = displayLang;
  if (displayLang === 'bilingual') {
    if (parsedCuesByLang['zh-Hans']?.length > 0) actualTrackLang = 'zh-Hans';
    else if (parsedCuesByLang['en']?.length > 0) actualTrackLang = 'en';
    else if (availableLangs.length > 0 && parsedCuesByLang[availableLangs[0]]?.length > 0) actualTrackLang = availableLangs[0];
    else actualTrackLang = 'none'; // No track available
  }
  // 为SRT字幕保留'srt'作为语言代码，否则映射'zh-Hans'到'zh'
  const trackLangCode = actualTrackLang === 'srt' ? 'srt' : 
                        (actualTrackLang === 'zh-Hans' ? 'zh' : actualTrackLang); // Map to 'zh' if needed

  const langOptions = [...availableLangs];
  // Only add bilingual option for VTT files, not for SRT
  if (availableLangs.includes('en') && availableLangs.includes('zh-Hans') && !availableLangs.includes('srt')) {
      langOptions.push('bilingual');
  }

  const getLangButtonLabel = (lang) => {
      let baseLabel = '';
      if (lang === 'en') baseLabel = 'English';
      else if (lang === 'zh-Hans') baseLabel = '中文';
      else if (lang === 'bilingual') baseLabel = '中英双语';
      else if (lang === 'srt') baseLabel = '字幕';
      else baseLabel = lang;
      
      // Add file type indicator if available
      if (parsedCuesByLang[lang]?.length > 0) {
          const firstCue = parsedCuesByLang[lang][0];
          if (firstCue.id?.includes('-srt-')) {
              return `${baseLabel} (SRT)`;
          } else if (firstCue.id?.includes('-vtt-') || firstCue.id?.includes('-cue-')) {
              return `${baseLabel} (VTT)`;
          }
      }
      
      return baseLabel;
  };

  const handleLanguageChange = (lang) => {
    // Store current video position before language change
    const currentTime = videoElementRef.current?.currentTime || 0;
    
    // Change the language
    setDisplayLang(lang);
    
    // Restore video position after React updates the DOM
    setTimeout(() => {
      if (videoElementRef.current) {
        videoElementRef.current.currentTime = currentTime;
      }
    }, 0);
  };





  return (
    <>
      <div className="flex flex-row flex-1 h-full p-4 gap-4 overflow-hidden bg-gray-100">

        {/* --- Left Column (Video + Subtitles) --- */}
        <div className="flex flex-col w-2/5 flex-shrink-0 gap-4 overflow-hidden">
          {/* Video Player Section */}
          <div className="flex flex-col flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Video / Preview</h2>
              <VideoTaskSelector apiBaseUrl={apiBaseUrl} currentTaskUuid={taskUuid} />
            </div>
            <div className="relative bg-black rounded shadow-md aspect-video">
              <div className="absolute top-0 left-0 w-full h-full">
                {(localVideoAvailable || embedVideoAvailable) ? (
                  <VideoPlayer
                    ref={videoElementRef}
                    localVideoPath={videoRelativePath}
                    apiBaseUrl={apiBaseUrl}
                    taskUuid={taskUuid}
                    embedUrl={embedUrl}
                    preferLocalVideo={preferLocalVideo}
                    // --- ADDED Props for Native Track (为原生字幕轨添加 Props) ---
                    vttUrl={preferLocalVideo ? vttBlobUrl : null} // Only pass URL if local video is preferred
                    vttLang={trackLangCode !== 'none' ? trackLangCode : null} // Pass language code (e.g., 'en', 'zh'), null if none
                    // -----------------------------------------------------------
                    // --- Pass cues array for timestamp navigation ---
                    cues={displayedCues}
                    // -----------------------------------------------------------
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                    No video preview available.
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 truncate" title={taskDetails?.title}>
                {taskDetails?.title || 'Untitled Task'}
            </p>
            {canToggleVideo && (
                <button
                    onClick={handleToggleVideo}
                    className="mt-1 btn btn-xs btn-outline self-start"
                >
                    {preferLocalVideo ? "切换到在线视频" : "切换到本地视频"}
                </button>
            )}
          </div>

          {/* VTT Previewer Section or Clipping Mode Placeholder */}
          <div className="flex flex-col flex-grow min-h-0"> {/* Ensure this div can grow and shrink */}
            <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                      {vttMode === 'cut' 
                        ? (clipModeType === 'subtitle' ? '字幕选择 (剪辑模式)' : '截图选择 (剪辑模式)')
                        : '字幕预览'} {/* Title changes */} 
                  </h3>
                   {/* Mode Toggle Buttons - RETAIN THESE */}
                  <div className="btn-group">
                      <button 
                          className={`btn btn-xs ${vttMode === 'preview' ? 'btn-active btn-ghost' : 'btn-ghost'}`}
                          onClick={() => toggleVttMode('preview')}
                      >
                          预览
                      </button>
                      <button 
                          className={`btn btn-xs ${vttMode === 'cut' ? 'btn-active btn-ghost' : 'btn-ghost'}`}
                          onClick={() => toggleVttMode('cut')}
                      >
                          剪辑
                      </button>
                  </div>

                  {/* Clip Mode Type Toggle - NEW */}
                  {vttMode === 'cut' && (
                    <div className="btn-group ml-2">
                      <button 
                        className={`btn btn-xs ${clipModeType === 'subtitle' ? 'btn-active btn-primary' : 'btn-outline btn-primary'}`}
                        onClick={() => toggleClipModeType('subtitle')}
                      >
                        字幕剪辑
                      </button>
                      <button 
                        className={`btn btn-xs ${clipModeType === 'keyframe' ? 'btn-active btn-primary' : 'btn-outline btn-primary'}`}
                        onClick={() => toggleClipModeType('keyframe')}
                      >
                        截图剪辑
                      </button>
                    </div>
                  )}
                  
                  {/* Subtitle Optimization Settings Toggle - NEW */}
                  {vttMode === 'preview' && (
                    <button
                      className={`btn btn-xs btn-ghost ${showOptimizationSettings ? 'btn-active' : ''}`}
                      onClick={() => setShowOptimizationSettings(!showOptimizationSettings)}
                      title="字幕优化设置"
                    >
                      ⚙️
                    </button>
                  )}
                  
                  {/* Cutting Mode Indicator - RETAIN THIS */}
                  {vttMode === 'cut' && (
                    <div className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-500 text-white">
                      剪辑模式
                    </div>
                  )}
              </div>
              <div className="flex gap-2">
                {/* Language Selection Buttons - RETAIN THESE */}
                {langOptions.map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`btn btn-xs ${displayLang === lang ? 'btn-active btn-primary' : 'btn-outline'}`}
                    disabled={!parsedCuesByLang[lang] && lang !== 'bilingual' && !(lang === 'en' && parsedCuesByLang['en']) && !(lang === 'zh-Hans' && parsedCuesByLang['zh-Hans'])}
                  >
                    {getLangButtonLabel(lang)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Batch Selection Controls (only in subtitle cut mode AND if VttPreviewer is in Left Column) - RETAIN & ADJUST LOGIC IF NEEDED */}
            {vttMode === 'cut' && clipModeType === 'subtitle' && preferLocalVideo && displayedCues.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 bg-base-200/50">
                <span className="text-xs text-gray-600">批量操作:</span>
                <button 
                  className="btn btn-xs btn-ghost" 
                  onClick={handleSelectAll}>
                  全选
                </button>
                <button 
                  className="btn btn-xs btn-ghost" 
                  onClick={handleSelectNone}>
                  取消全选
                </button>
                <div className="ml-auto text-xs text-gray-600">
                  已选择: <span className="font-semibold text-accent">{selectedCueIds.size}</span> / {displayedCues.length}
                </div>
              </div>
            )}

            {/* Subtitle Optimization Settings Panel - Collapsible */}
            {vttMode === 'preview' && showOptimizationSettings && (
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">启用优化</label>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={subtitleOptimization.enabled}
                      onChange={(e) => setSubtitleOptimization(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }))}
                    />
                  </div>

                  {subtitleOptimization.enabled && (
                    <>
                      {/* Min Display Time */}
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">最小显示时间 (秒)</label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          className="range range-primary range-xs"
                          value={subtitleOptimization.minDisplayTime}
                          onChange={(e) => setSubtitleOptimization(prev => ({
                            ...prev,
                            minDisplayTime: parseFloat(e.target.value)
                          }))}
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {subtitleOptimization.minDisplayTime}s
                        </div>
                      </div>

                      {/* Max Gap for Merge */}
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">最大合并间隔 (秒)</label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          className="range range-primary range-xs"
                          value={subtitleOptimization.maxGapForMerge}
                          onChange={(e) => setSubtitleOptimization(prev => ({
                            ...prev,
                            maxGapForMerge: parseFloat(e.target.value)
                          }))}
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {subtitleOptimization.maxGapForMerge}s
                        </div>
                      </div>

                      {/* Min Text Length for Short */}
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">短句字符数阈值</label>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          className="range range-primary range-xs"
                          value={subtitleOptimization.minTextLengthForShort}
                          onChange={(e) => setSubtitleOptimization(prev => ({
                            ...prev,
                            minTextLengthForShort: parseInt(e.target.value)
                          }))}
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {subtitleOptimization.minTextLengthForShort} 字符
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 p-2 bg-white rounded border">
                        💡 短于阈值的句子会被延长显示时间或与相邻句子合并
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Conditional Rendering: Placeholder or VTT Previewer */}
            {vttMode === 'preview' ? (
              <div className="flex-grow overflow-y-auto p-4 pt-2 custom-scrollbar">
                {preferLocalVideo ? (
                  displayedCues.length > 0 ? (
                    <VttPreviewer
                      cues={displayedCues}
                      videoRef={videoElementRef}
                      syncEnabled={true} 
                      onCueSelect={undefined} // No selection in preview mode
                      selectedCues={undefined}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm italic flex items-center justify-center h-full">
                      {availableLangs.length === 0
                        ? 'No VTT files found for this task.'
                        : `No subtitles loaded or available for ${getLangButtonLabel(displayLang)}.`}
                    </p>
                  )
                ) : (
                  displayedCues.length > 0 ? (
                    <VttPreviewer
                      cues={displayedCues}
                      videoRef={videoElementRef}
                      syncEnabled={false}
                      onCueSelect={undefined} // No selection in preview mode
                      selectedCues={undefined}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm italic flex items-center justify-center h-full">
                      No subtitles loaded or available for {getLangButtonLabel(displayLang)}.
                    </p>
                  )
                )}
              </div>
            ) : ( /* vttMode === 'cut' */
              <div className="flex-grow flex items-center justify-center bg-base-200 p-4 rounded-lg shadow text-gray-500 italic">
                {clipModeType === 'subtitle' 
                  ? '字幕剪辑模式 - 请在中间面板选择字幕进行剪辑'
                  : '截图剪辑模式 - 请在中间面板进行关键帧剪辑'}
              </div>
            )}
            
            {/* Cutting Controls Section (Only in Subtitle Cut Mode) - RETAIN & ADJUST LOGIC IF NEEDED */}
            {vttMode === 'cut' && clipModeType === 'subtitle' && preferLocalVideo && displayedCues.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-3">
                {/* 连续片段检测提示 */}
                {selectedCueIds.size > 1 && (() => {
                  const segments = Array.from(selectedCueIds)
                    .map(id => displayedCues.find(cue => cue.id === id))
                    .filter(Boolean)
                    .map(cue => ({ start: cue.startTime, end: cue.endTime }))
                    .sort((a, b) => a.start - b.start);
                  
                  const gaps = [];
                  for (let i = 1; i < segments.length; i++) {
                    gaps.push(segments[i].start - segments[i-1].end);
                  }
                  const maxGap = Math.max(...gaps);
                  const isContinuous = maxGap <= 2.0;
                  
                  return (
                    <div className={`text-xs p-2 rounded-md ${isContinuous ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {isContinuous ? 
                        `✓ 检测到连续片段，将自动合并 (最大间隔: ${maxGap.toFixed(2)}s)` :
                        `⚠ 片段不连续，将分别截取后拼接 (最大间隔: ${maxGap.toFixed(2)}s)`
                      }
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3">
                  <select 
                    className="select select-bordered select-sm"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                  >
                    <option value="video">视频片段</option>
                    <option value="wav">WAV 音频</option>
                  </select>
                  
                  <button
                    className={`btn btn-primary flex-grow ${cuttingStatus === 'processing' ? 'loading' : ''}`}
                    onClick={handleCutVideoClick}
                    disabled={selectedCueIds.size === 0 || cuttingStatus === 'processing'}
                  >
                    {cuttingStatus === 'processing' ? '正在处理...' : 
                      outputFormat === 'video' ? 
                        `剪辑选中的 ${selectedCueIds.size} 个片段` : 
                        `提取选中的 ${selectedCueIds.size} 个片段的音频`}
                  </button>
                </div>

                {cuttingJobId && cuttingStatus === 'completed' && cutOutputPath && (
                  <div className="mt-2">
                    <a 
                      href={`${apiBaseUrl}/files/${cutOutputPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-success w-full"
                      download
                    >
                      下载{outputFormat === 'video' ? '视频' : '音频'}片段
                    </a>
                  </div>
                )}
                
                {cuttingJobId && cuttingStatus === 'failed' && (
                  <div className="text-sm p-2 rounded-md bg-error/20 text-error mt-2">
                    {cuttingMessage || '剪辑失败'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 剪辑状态和控制面板 */}
          {vttMode === 'cut' && (
            <div className="flex flex-col w-full mt-4 space-y-4">
              
              {/* 字幕剪辑状态 */}
              {clipModeType === 'subtitle' && selectedCueIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">将嵌入字幕:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    embeddingSubtitleLang !== 'none' 
                      ? 'bg-success text-success-content' 
                      : 'bg-error text-error-content'
                  }`}>
                    {getSubtitleLangLabel(embeddingSubtitleLang)}
                  </span>
                  <span className="text-xs text-gray-500">
                    (取决于当前选择的字幕语言)
                  </span>
                </div>
              )}

              {/* 统一的剪辑状态面板 */}
              {cuttingJobId && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {clipModeType === 'subtitle' ? '字幕剪辑状态:' : '关键帧剪辑状态:'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        cuttingStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        cuttingStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        cuttingStatus === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {cuttingStatus === 'processing' ? '处理中...' :
                         cuttingStatus === 'completed' ? '完成' :
                         cuttingStatus === 'failed' ? '失败' : '待处理'}
                      </span>
                    </div>
                    
                    {cuttingMessage && (
                      <div className="text-sm text-gray-600">
                        {cuttingMessage}
                      </div>
                    )}

                    {cuttingJobId && cuttingStatus === 'completed' && cutOutputPath && (
                      <div>
                        <a 
                          href={`${apiBaseUrl}/files/${cutOutputPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-success"
                          download
                        >
                          下载{outputFormat === 'video' ? '视频' : '音频'}片段
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


        </div>

        {/* --- Middle Column (AI Chat, VTT Previewer, or Keyframe Clip Panel) --- */}
        <div className="flex flex-col flex-1 bg-white p-4 rounded-lg shadow overflow-auto custom-scrollbar">
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-2 flex-shrink-0">
            {vttMode === 'cut' && clipModeType === 'subtitle' ? "字幕选择 (剪辑模式)" :
             vttMode === 'cut' && clipModeType === 'keyframe' ? "关键帧剪辑 (剪辑模式)" : 
             "AI 对话"}
          </h3>
          {vttMode === 'cut' && clipModeType === 'subtitle' ? (
            <div className="flex-grow min-h-0 custom-scrollbar">
              <VttPreviewer
                cues={displayedCues}
                videoRef={videoElementRef}
                syncEnabled={true} 
                onCueSelect={handleCueSelect}
                selectedCues={selectedCueIds}
              />
            </div>
          ) : vttMode === 'cut' && clipModeType === 'keyframe' ? (
            <div className="flex-grow min-h-0 custom-scrollbar">
              <KeyframeClipPanel 
                taskUuid={taskUuid}
                onClipSegments={handleKeyframeClipSegments}
                videoRef={videoElementRef}
              />
            </div>
          ) : (
            <div className="flex-grow h-full custom-scrollbar">
              <AIChat 
                markdownContent={markdownContent}
                apiBaseUrl={apiBaseUrl}
                taskUuid={taskUuid}  // 确保传递这个prop
              />
            </div>
          )}
        </div>

        {/* --- Right Column (StudioWorkSpace) --- */}
        <div className="flex flex-col w-1/4 flex-shrink-0 gap-4 overflow-auto custom-scrollbar">
          <StudioWorkSpace 
            taskUuid={taskUuid} 
            apiBaseUrl={apiBaseUrl} 
            markdownContent={markdownContent} // 传递 markdown 内容作为备用
            videoRef={videoElementRef} // 传递视频引用以支持时间戳点击
          />
        </div>

      </div>
    </>
  );
}

export default Studio; 
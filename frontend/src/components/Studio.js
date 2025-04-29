import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { WebVTTParser } from 'webvtt-parser';

import VideoPlayer from './VideoPlayer';
import VttPreviewer from './VttPreviewer';
import MarkdownViewer from './MarkdownViewer';

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
      const parsed = finalCues.filter(cue => cue.text);
      
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
      const fallbackParsed = fallbackTree.cues
        .filter(cue => cue && cue.startTime !== undefined && cue.endTime !== undefined && cue.startTime < cue.endTime)
        .map(cue => ({ startTime: cue.startTime, endTime: cue.endTime, text: cleanText(cue.text) }))
        .sort((a, b) => a.startTime - b.startTime);

      if (fallbackParsed.length > 0) {
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
    const manualCues = [];
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
      const msg = `Manual extraction successful, ${manualCues.length} cues recovered.`;
      parseError = parseError ? `${parseError} ${msg}` : msg;
      console.log(`VTT (${lang}): ${msg}`);
      // Clean text one last time
      manualCues.forEach(cue => cue.text = cleanText(cue.text));
      return { cues: manualCues.sort((a,b) => a.startTime - b.startTime), error: parseError };
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
    if (cue.startTime === undefined || cue.endTime === undefined || cue.startTime >= cue.endTime || !cue.text) {
        console.warn("Skipping invalid cue during VTT string generation (生成 VTT 字符串时跳过无效 cue):", cue);
        return; // 跳过这个 cue
    }

    const startTimeFormatted = formatTime(cue.startTime);
    const endTimeFormatted = formatTime(cue.endTime);

    // 添加 cue 标识符 (可选, 但推荐)
    vttString += `${index + 1}\n`;
    vttString += `${startTimeFormatted} --> ${endTimeFormatted}\n`;
    
    // Properly handle bilingual text with line breaks
    // For bilingual support, preserve newlines in the text
    // Check if text contains newlines (which would indicate bilingual content)
    const hasNewlines = cue.text.includes('\n');
    
    if (hasNewlines) {
      // For bilingual text, preserve newlines but trim whitespace
      vttString += `${cue.text.trim()}\n\n`; // Preserve internal newlines
    } else {
      // For single language text, replace newlines with spaces as before
      vttString += `${cue.text.replace(/\n+/g, ' ').trim()}\n\n`;
    }
  });

  return vttString;
};
// -------------------------------------

// Props:
// - taskUuid: The UUID of the task to display in the studio.
// - apiBaseUrl: The base URL for the API.

function Studio({ taskUuid, apiBaseUrl }) {
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

            // --- 2. Fetch All Available VTTs and Markdown Concurrently --- 
            console.log("Studio: Fetching VTTs and Markdown...");
            const vttFilesToFetch = details.vtt_files || {};
            const langCodes = Object.keys(vttFilesToFetch).filter(lang => vttFilesToFetch[lang]); // Get valid lang codes
            setAvailableLangs(langCodes); // Update available languages state
            console.log("Studio: Available VTT languages:", langCodes);

            const vttPromises = langCodes.map(lang => {
                const vttFilePath = vttFilesToFetch[lang]; // e.g., "<uuid>/transcript_en.vtt"
                if (!vttFilePath) {
                    console.error(`Studio: No VTT file path found for lang ${lang} in task details.`);
                    return Promise.resolve({ lang, status: 'rejected', reason: `No VTT file path found for ${lang}` });
                }
                // Extract only the filename (the part after the last '/')
                const vttFilename = vttFilePath.split('/').pop();
                if (!vttFilename) { // Basic check in case the path is weird
                    console.error(`Studio: Could not extract filename from VTT path '${vttFilePath}' for lang ${lang}.`);
                    return Promise.resolve({ lang, status: 'rejected', reason: `Invalid VTT file path format for ${lang}` });
                }

                // Construct URL using the generic file endpoint and *only* the filename
                const vttFileUrl = `${apiBaseUrl}/api/tasks/${taskUuid}/files/${vttFilename}`;
                console.log(`Studio: Fetching VTT for ${lang} from ${vttFileUrl}`);
                return axios.get(vttFileUrl, { responseType: 'text' })
                    .then(response => ({ lang, status: 'fulfilled', data: response.data }))
                    .catch(err => ({ lang, status: 'rejected', reason: err.response?.data?.detail || err.message }))
            });

            const markdownPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/markdown/parallel`, { responseType: 'text' })
                .then(response => ({ status: 'fulfilled', data: response.data }))
                .catch(err => ({ status: 'rejected', reason: err.response?.data?.detail || err.message }));

            const allPromises = [...vttPromises, markdownPromise];
            const results = await Promise.allSettled(allPromises); // Use allSettled

            console.log("Studio: VTT and Markdown fetch results:", results);

            // --- Process VTT Results --- 
            const newParsedCues = {};
            const newVttErrors = {};
            results.slice(0, vttPromises.length).forEach((result, index) => {
                const lang = langCodes[index]; // Get lang code corresponding to promise index
                if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
                    const rawVtt = result.value.data;
                    const { cues, error: parsingError } = parseVtt(rawVtt, lang); // USE THE FIXED parseVtt
                    newParsedCues[lang] = cues;
                    if (parsingError) {
                        console.warn(`Studio: VTT parsing issues for ${lang}:`, parsingError);
                        newVttErrors[lang] = parsingError;
                    }
                    console.log(`Studio: VTT for ${lang} loaded and parsed successfully (${cues.length} cues).`);
                } else {
                    const reason = result.status === 'fulfilled' ? result.value.reason : (result.reason || 'Unknown fetch error');
                    console.error(`Studio: Failed to fetch or process VTT for ${lang}:`, reason);
                    newVttErrors[lang] = `Failed to load: ${reason}`;
                }
            });
            setParsedCuesByLang(newParsedCues);
            setVttErrors(newVttErrors);
            console.log("Studio Debug: Processed VTT results (VTT 处理结果):", { parsedCuesByLang: newParsedCues, vttErrors: newVttErrors });

            // --- Process Markdown Result --- 
            const markdownResult = results[results.length - 1]; // Last result is markdown
            if (markdownResult.status === 'fulfilled' && markdownResult.value.status === 'fulfilled') {
                setMarkdownContent(markdownResult.value.data);
                console.log("Studio: Markdown content loaded.");
            } else {
                const reason = markdownResult.status === 'fulfilled' ? markdownResult.value.reason : (markdownResult.reason || 'Unknown fetch error');
                console.error("Studio: Failed to load Markdown:", reason);
                setError(prev => prev ? `${prev} Failed to load Markdown.` : 'Failed to load Markdown.'); // Append or set error
                setMarkdownContent('');
            }

            // Set initial displayLang based on availability
            if (!displayLang || !langCodes.includes(displayLang)) {
                if (langCodes.includes('zh-Hans')) setDisplayLang('zh-Hans');
                else if (langCodes.includes('en')) setDisplayLang('en');
                else if (langCodes.length > 0) setDisplayLang(langCodes[0]);
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
        if (enCues.length > 0 && zhCues.length > 0) {
            // Create bilingual cues for better native rendering
            const mergedCues = [];
            const maxLength = Math.max(enCues.length, zhCues.length);
            
            for (let i = 0; i < maxLength; i++) {
                const enCue = enCues[i] || null;
                const zhCue = zhCues[i] || null;
                
                // Skip if both cues are missing
                if (!enCue && !zhCue) continue;
                
                // Prioritize zh timing if available, else en
                const startTime = zhCue?.startTime ?? enCue?.startTime;
                const endTime = zhCue?.endTime ?? enCue?.endTime;
                
                if (startTime !== undefined && endTime !== undefined && startTime < endTime) {
                    // Create a combined text with both languages
                    let combinedText = '';
                    if (zhCue?.text) combinedText += zhCue.text;
                    if (zhCue?.text && enCue?.text) combinedText += '\n';
                    if (enCue?.text) combinedText += enCue.text;
                    
                    mergedCues.push({
                        startTime,
                        endTime,
                        text: combinedText
                    });
                }
            }
            
            cuesToUse = mergedCues;
            langForTrack = 'zh'; // Use Chinese as default language code
        } else if (zhCues.length > 0) {
            cuesToUse = zhCues;
            langForTrack = 'zh-Hans';
        } else if (enCues.length > 0) {
            cuesToUse = enCues;
            langForTrack = 'en';
        } else if (availableLangs.length > 0 && parsedCuesByLang[availableLangs[0]]?.length > 0) {
            cuesToUse = parsedCuesByLang[availableLangs[0]];
            langForTrack = availableLangs[0];
        }
        console.log(`Studio: Bilingual mode selected, using native track for (双语模式, 原生字幕轨使用): ${langForTrack}`);
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
        const vttString = formatCuesToVttString(cuesToUse);
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

  }, [parsedCuesByLang, displayLang, availableLangs]); // Dependencies


  // --- Compute displayed cues for VttPreviewer (为 VttPreviewer 计算要显示的 cues - 保持不变) ---
  const displayedCues = useMemo(() => {
    console.log("Studio Debug: Computing displayed cues for lang (计算 VttPreviewer cues):", displayLang, "Raw parsed cues:", parsedCuesByLang); // Added log
    if (displayLang === 'bilingual') {
        const enCues = parsedCuesByLang['en'] || [];
        const zhCues = parsedCuesByLang['zh-Hans'] || [];
        if (!enCues.length && !zhCues.length) return [];

        // Simple bilingual merge: Pair by index.
        const maxLength = Math.max(enCues.length, zhCues.length);
        const mergedCues = [];
        for (let i = 0; i < maxLength; i++) {
            const enCue = enCues[i];
            const zhCue = zhCues[i];
            // Prioritize zh timing if available, else en
            const startTime = zhCue?.startTime ?? enCue?.startTime;
            const endTime = zhCue?.endTime ?? enCue?.endTime;

            if (startTime !== undefined && endTime !== undefined && startTime < endTime) {
                mergedCues.push({
                    startTime,
                    endTime,
                    enText: enCue?.text || null,
                    zhText: zhCue?.text || null,
                    isBilingual: true
                });
            }
        }
        return mergedCues.sort((a, b) => a.startTime - b.startTime);

    } else if (parsedCuesByLang[displayLang]) {
        return parsedCuesByLang[displayLang].map(cue => ({ ...cue, isBilingual: false }));
    } else {
        return [];
    }
  }, [displayLang, parsedCuesByLang]); // 添加依赖项

  console.log("Studio Debug: Computed displayedCues for VttPreviewer (计算得到的 VttPreviewer cues, length:", displayedCues.length, "):", displayedCues.slice(0, 5)); // Log first 5 cues


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
  const trackLangCode = actualTrackLang === 'zh-Hans' ? 'zh' : actualTrackLang; // Map to 'zh' if needed

  const langOptions = [...availableLangs];
  if (availableLangs.includes('en') && availableLangs.includes('zh-Hans')) {
      langOptions.push('bilingual');
  }

  const getLangButtonLabel = (lang) => {
      if (lang === 'en') return 'English';
      if (lang === 'zh-Hans') return '中文';
      if (lang === 'bilingual') return '中英双语';
      return lang;
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
    <div className="flex flex-row flex-1 h-full p-4 gap-4 overflow-hidden bg-gray-100">

      {/* --- Left Column (Video + Subtitles) --- */}
      <div className="flex flex-col w-2/5 flex-shrink-0 gap-4 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-col flex-shrink-0">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Video / Preview</h2>
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

        {/* VTT Previewer Section (保留 VttPreviewer) */}
        <div className="flex flex-col flex-grow overflow-hidden bg-white rounded shadow-md">
           <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-200 flex-shrink-0">
             <h3 className="font-semibold">VTT Subtitles (Scrollable Preview)</h3>
             <div className="flex gap-2">
               {langOptions.map(lang => (
                 <button
                   key={lang}
                   onClick={() => handleLanguageChange(lang)}
                   className={`btn btn-xs ${displayLang === lang ? 'btn-active btn-primary' : 'btn-outline'}`}
                   disabled={!parsedCuesByLang[lang] && lang !== 'bilingual'} // Disable if single lang cues failed to load
                 >
                   {getLangButtonLabel(lang)}
                 </button>
               ))}
             </div>
           </div>
           <div className="flex-grow overflow-y-auto p-4 pt-2">
             {/* Conditionally render VttPreviewer or message */}
             {preferLocalVideo ? (
                displayedCues.length > 0 ? (
                  <VttPreviewer
                    cues={displayedCues} 
                    videoRef={videoElementRef} 
                    syncEnabled={true} // <-- Pass syncEnabled as true when local
                  />
                ) : (
                  <p className="text-gray-500 text-sm italic flex items-center justify-center h-full">
                    {availableLangs.length === 0
                      ? 'No VTT files found for this task.'
                      : `No subtitles loaded or available for ${getLangButtonLabel(displayLang)}.`}
                  </p>
                )
             ) : (
                // If showing embed, still render VttPreviewer but disable sync
                displayedCues.length > 0 ? (
                     <VttPreviewer
                        cues={displayedCues} 
                        videoRef={videoElementRef} 
                        syncEnabled={false} // <-- Pass syncEnabled as false when embed
                      />
                ) : (
                  // Message when embed AND no cues
                   <p className="text-gray-500 text-sm italic flex items-center justify-center h-full">
                       No subtitles loaded or available for {getLangButtonLabel(displayLang)}.
                   </p>
                )
             )}
           </div>
        </div>
      </div>

      {/* --- Middle Column (AI Chat Placeholder) --- */}
      <div className="flex flex-col flex-1 bg-white p-4 rounded-lg shadow overflow-auto">
        <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-2 flex-shrink-0">AI 对话</h3>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 italic">(AI Chat Interface Placeholder)</p>
        </div>
      </div>

      {/* --- Right Column (Markdown Viewer) --- */}
      <div className="flex flex-col w-1/4 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden">
         <h3 className="text-lg font-semibold p-4 pb-2 border-b border-gray-300 flex-shrink-0">Markdown Summary</h3>
         <div className="flex-grow overflow-y-auto p-4 pt-2"> {/* Scrollable content area */}
            {markdownContent ? (
                <MarkdownViewer markdown={markdownContent} />
            ) : (
                 <p className="text-gray-500 text-sm">No Markdown summary loaded.</p>
            )}
         </div>
      </div>

    </div>
  );
}

export default Studio; 
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // --- Data Fetching Effect (Modified) ---
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

    if (!taskUuid || !apiBaseUrl) {
      setError('Missing Task UUID or API Base URL');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
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
                const { cues, error: parsingError } = parseVtt(rawVtt, lang);
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

  }, [taskUuid, apiBaseUrl]); // Re-run effect if UUID or API URL changes

  // --- Compute displayed cues based on selected language mode --- 
  const computeDisplayedCues = () => {
      if (displayLang === 'bilingual') {
          const enCues = parsedCuesByLang['en'] || [];
          const zhCues = parsedCuesByLang['zh-Hans'] || [];
          if (!enCues.length && !zhCues.length) return [];
          
          // Simple bilingual merge: Pair by index.
          // A more robust solution would use timecodes for alignment.
          const maxLength = Math.max(enCues.length, zhCues.length);
          const mergedCues = [];
          for (let i = 0; i < maxLength; i++) {
              const enCue = enCues[i];
              const zhCue = zhCues[i];
              const startTime = zhCue?.startTime ?? enCue?.startTime;
              const endTime = zhCue?.endTime ?? enCue?.endTime;
              
              if (startTime !== undefined && endTime !== undefined) {
                   // Return separate fields, use null if missing
                   mergedCues.push({
                       startTime,
                       endTime,
                       enText: enCue?.text || null, 
                       zhText: zhCue?.text || null,
                       isBilingual: true // Add a flag for VttPreviewer
                   });
              }
          }
          // Need to sort again potentially if timings were mixed from en/zh
          return mergedCues.sort((a, b) => a.startTime - b.startTime);
          
      } else if (parsedCuesByLang[displayLang]) {
          // For single language, return standard format but maybe add flag?
          // Or VttPreviewer can check if enText/zhText exist
          return parsedCuesByLang[displayLang].map(cue => ({ ...cue, isBilingual: false })); 
      } else {
          return []; 
      }
  };
  
  const displayedCues = computeDisplayedCues();
  console.log("Studio Debug: Computed displayedCues (length:", displayedCues.length, "):", displayedCues.slice(0, 5)); // Log first 5 cues

  // --- Render Logic (Keep most as is) ---

  // Show loading state first
  if (isLoading) {
    return <div className="p-4 text-center flex-grow flex items-center justify-center">Loading Studio...</div>;
  }
  
  // Show error if taskUuid is missing (moved from effect for clarity)
  if (!taskUuid) {
    return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">Please select a task to view in Studio.</div>;
  }

  // Show general fetch error if occurred (excluding VTT/Markdown specific errors handled below)
  if (error && !taskDetails) { // Only show general error if details also failed
      return <div className="p-4 text-center text-red-500 flex-grow flex items-center justify-center">Error: {error}</div>;
  }

  // If loading is finished but no details (maybe API issue)
  if (!taskDetails) {
    return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">No task details could be loaded.</div>;
  }

  // Determine if sources are available (needed for canToggle)
  const localVideoAvailable = Boolean(videoRelativePath);
  const embedVideoAvailable = Boolean(embedUrl);

  // --- NEW: Calculate canToggle and define handleToggle --- 
  const allowToggle = true; // Or make this configurable if needed
  const canToggleVideo = localVideoAvailable && embedVideoAvailable && allowToggle;

  const handleToggleVideo = () => {
    if (canToggleVideo) {
      setPreferLocalVideo(!preferLocalVideo);
    }
  };

  // Construct local video URL *only* if videoRelativePath is not empty
  // IMPORTANT: Ensure this URL matches your backend file serving route
  const localVideoSrc = videoRelativePath
    ? `${apiBaseUrl}/api/tasks/${taskUuid}/files/${videoRelativePath}`
    : null;

  // --- Create Language Buttons --- 
  const langOptions = [...availableLangs];
  if (availableLangs.includes('en') && availableLangs.includes('zh-Hans')) {
      langOptions.push('bilingual');
  }
  
  const getLangButtonLabel = (lang) => {
      if (lang === 'en') return 'English';
      if (lang === 'zh-Hans') return '中文';
      if (lang === 'bilingual') return '中英双语';
      return lang; // Fallback
  };
  
  // Check for VTT errors for the *currently selected* display language
  const currentVttError = displayLang !== 'bilingual' ? vttErrors[displayLang] : (vttErrors['en'] || vttErrors['zh-Hans']);

  return (
    // Restore 3-column layout: Left(Video/VTT), Middle(Chat), Right(Markdown)
    <div className="flex flex-row flex-1 h-full p-4 gap-4 overflow-hidden bg-gray-100">
      
      {/* --- Left Column (Video + Subtitles) --- */}
      <div className="flex flex-col w-2/5 flex-shrink-0 gap-4 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-col flex-shrink-0"> 
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Video / Preview</h2>
          <div className="relative bg-black rounded shadow-md aspect-video">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Pass preferLocalVideo state to VideoPlayer */} 
              {(localVideoAvailable || embedVideoAvailable) ? (
                <VideoPlayer
                  ref={videoElementRef}
                  localVideoPath={videoRelativePath}
                  apiBaseUrl={apiBaseUrl}
                  taskUuid={taskUuid}
                  embedUrl={embedUrl}
                  preferLocalVideo={preferLocalVideo} // Pass the state
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
          {/* Render toggle button here if possible */} 
          {canToggleVideo && (
              <button 
                  onClick={handleToggleVideo}
                  className="mt-1 btn btn-xs btn-outline self-start" // Adjust margin/alignment
              >
                  {preferLocalVideo ? "切换到在线视频" : "切换到本地视频"}
              </button>
          )}
        </div>
        
        {/* VTT Previewer Section (Modified) */}
        <div className="flex flex-col flex-grow overflow-hidden bg-white rounded shadow-md"> 
           <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-200 flex-shrink-0">
             <h3 className="font-semibold">VTT Subtitles</h3>
             {/* Language Selection Buttons */} 
             <div className="flex gap-2">
               {langOptions.map(lang => (
                 <button 
                   key={lang}
                   onClick={() => setDisplayLang(lang)}
                   className={`btn btn-xs ${displayLang === lang ? 'btn-active btn-primary' : 'btn-outline'}`}
                   disabled={!parsedCuesByLang[lang] && lang !== 'bilingual'} // Disable if single lang cues failed to load
                 >
                   {getLangButtonLabel(lang)}
                 </button>
               ))}
             </div>
           </div>
           <div className="flex-grow overflow-y-auto p-4 pt-2"> 
             {displayedCues.length > 0 ? (
                 <VttPreviewer
                   cues={displayedCues} // Pass dynamically computed cues
                   videoRef={videoElementRef}
                   onCueClick={(cue) => {
                     if (videoElementRef.current && localVideoSrc) {
                       videoElementRef.current.currentTime = cue.startTime;
                       videoElementRef.current.play(); 
                     }
                     console.log("Cue clicked:", cue);
                   }}
                 />
             ) : (
                 <p className="text-gray-500 text-sm">
                   {availableLangs.length === 0 ? 'No VTT files found for this task.' : 'No cues parsed or available for the selected language mode.'}
                 </p>
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
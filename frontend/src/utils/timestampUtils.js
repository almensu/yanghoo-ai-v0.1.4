/**
 * 时间戳工具类 - 处理不同格式的时间戳和转换，统一时间戳解析逻辑
 */

/**
 * 将时间字符串转换为秒数
 * @param {string} timeStr - 时间字符串，格式可以是 HH:MM:SS、MM:SS 或带方括号 [HH:MM:SS]
 * @returns {number} - 转换后的秒数
 */
export const timeToSeconds = (timeStr) => {
  try {
    console.log(`[timestampUtils] timeToSeconds input: "${timeStr}" (type: ${typeof timeStr})`);
    
    if (!timeStr) {
      console.log(`[timestampUtils] Empty timeStr, returning 0`);
      return 0;
    }
    
    // 如果已经是数字，直接返回
    if (typeof timeStr === 'number') {
      console.log(`[timestampUtils] Input is already a number: ${timeStr}`);
      return timeStr;
    }
    
    // 转换为字符串并清理
    let cleanTimeStr = String(timeStr).trim();
    console.log(`[timestampUtils] Cleaned input: "${cleanTimeStr}"`);
    
    // 如果是纯数字字符串，直接转换为秒
    if (/^\d+$/.test(cleanTimeStr)) {
      const result = parseInt(cleanTimeStr);
      console.log(`[timestampUtils] Pure number string -> ${result}s`);
      return result;
    }
    
    // 如果是YouTube t参数格式 (123s, 123)
    if (/^\d+s?$/.test(cleanTimeStr)) {
      const result = parseInt(cleanTimeStr.replace('s', ''));
      console.log(`[timestampUtils] YouTube seconds format -> ${result}s`);
      return result;
    }
    
    // 移除各种类型的括号和空格
    const bracketPatterns = [
      { pattern: /^\[(.+)\]$/, name: '方括号' },
      { pattern: /^\((.+)\)$/, name: '圆括号' },
      { pattern: /^【(.+)】$/, name: '中文方括号' },
      { pattern: /^《(.+)》$/, name: '书名号' },
      { pattern: /^「(.+)」$/, name: '日文引号' },
      { pattern: /^『(.+)』$/, name: '中文书名号' }
    ];
    
    for (const bracket of bracketPatterns) {
      const match = cleanTimeStr.match(bracket.pattern);
      if (match) {
        cleanTimeStr = match[1].trim();
        console.log(`[timestampUtils] Removed ${bracket.name}: "${timeStr}" -> "${cleanTimeStr}"`);
        break;
      }
    }
    
    // 处理特殊分隔符，统一转换为冒号
    const separatorPatterns = [
      { pattern: /-/, replacement: ':', name: '横线' },
      { pattern: /\s+/, replacement: ':', name: '空格' },
      { pattern: /[，,]/, replacement: ':', name: '逗号' },
      { pattern: /[。.]/, replacement: ':', name: '句号' }
    ];
    
    let originalCleanStr = cleanTimeStr;
    for (const sep of separatorPatterns) {
      if (sep.pattern.test(cleanTimeStr)) {
        cleanTimeStr = cleanTimeStr.replace(new RegExp(sep.pattern, 'g'), sep.replacement);
        console.log(`[timestampUtils] Replaced ${sep.name} separators: "${originalCleanStr}" -> "${cleanTimeStr}"`);
        break;
      }
    }
    
    // 处理连续的冒号或点
    cleanTimeStr = cleanTimeStr.replace(/[:\.]{2,}/g, ':');
    cleanTimeStr = cleanTimeStr.replace(/^:+|:+$/g, ''); // 移除开头和结尾的冒号
    
    // 分割时间部分
    const parts = cleanTimeStr.split(':').filter(part => part !== ''); // 过滤空字符串
    let hours = 0, minutes = 0, seconds = 0;
    
    console.log(`[timestampUtils] Split parts: [${parts.join(', ')}] (length: ${parts.length})`);
    
    if (parts.length === 0) {
      console.log(`[timestampUtils] No valid parts found, returning 0`);
      return 0;
    } else if (parts.length === 1) {
      // 只有一个数字，可能是秒数或分钟数
      const singleValue = parseFloat(parts[0]);
      if (singleValue > 59) {
        // 大于59，可能是总秒数
        console.log(`[timestampUtils] Single large value treated as total seconds: ${singleValue}`);
        return singleValue;
      } else {
        // 小于等于59，作为秒数
        seconds = singleValue;
        console.log(`[timestampUtils] Single small value treated as seconds: ${seconds}`);
      }
    } else if (parts.length === 2) {
      // MM:SS 格式
      [minutes, seconds] = parts.map(parseFloat);
      console.log(`[timestampUtils] Parsed as MM:SS -> ${minutes}:${seconds}`);
    } else if (parts.length === 3) {
      // HH:MM:SS 格式
      [hours, minutes, seconds] = parts.map(parseFloat);
      console.log(`[timestampUtils] Parsed as HH:MM:SS -> ${hours}:${minutes}:${seconds}`);
    } else if (parts.length === 4) {
      // HH:MM:SS:MS 格式 (将最后一部分当作毫秒)
      [hours, minutes, seconds] = parts.slice(0, 3).map(parseFloat);
      const ms = parseFloat(parts[3]) / 1000; // 转换毫秒为秒的小数部分
      seconds += ms;
      console.log(`[timestampUtils] Parsed as HH:MM:SS:MS -> ${hours}:${minutes}:${seconds}`);
    } else {
      // 太多部分，取前三个
      [hours, minutes, seconds] = parts.slice(0, 3).map(parseFloat);
      console.log(`[timestampUtils] Too many parts, using first 3: ${hours}:${minutes}:${seconds}`);
    }
    
    // 验证和修正数值
    hours = Math.max(0, Math.floor(hours || 0));
    minutes = Math.max(0, Math.floor(minutes || 0));
    seconds = Math.max(0, parseFloat(seconds || 0));
    
    // 如果分钟或秒数超过60，进行进位
    if (seconds >= 60) {
      const extraMinutes = Math.floor(seconds / 60);
      minutes += extraMinutes;
      seconds = seconds % 60;
      console.log(`[timestampUtils] Seconds overflow, adjusted: ${minutes}:${seconds}`);
    }
    
    if (minutes >= 60) {
      const extraHours = Math.floor(minutes / 60);
      hours += extraHours;
      minutes = minutes % 60;
      console.log(`[timestampUtils] Minutes overflow, adjusted: ${hours}:${minutes}:${seconds}`);
    }
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    console.log(`[timestampUtils] Final result: ${totalSeconds}s (${hours}h ${minutes}m ${seconds}s)`);
    
    // 验证结果的合理性
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      console.error(`[timestampUtils] Invalid result: ${totalSeconds}, returning 0`);
      return 0;
    }
    
    return totalSeconds;
  } catch (error) {
    console.error("时间戳转换错误:", error, "输入:", timeStr);
    return 0;
  }
};

/**
 * 将秒数转换为格式化的时间字符串
 * @param {number} seconds - 秒数
 * @param {boolean} withBrackets - 是否包含方括号
 * @returns {string} - 格式化的时间字符串，例如 00:01:30 或 [00:01:30]
 */
export const secondsToTimeString = (seconds, withBrackets = false) => {
  if (isNaN(seconds) || seconds < 0) {
    return withBrackets ? '[00:00:00]' : '00:00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  return withBrackets ? `[${timeStr}]` : timeStr;
};

/**
 * 判断字符串是否是有效的时间戳格式
 * @param {string} str - 要检查的字符串
 * @returns {boolean} - 是否是有效的时间戳
 */
export const isTimestamp = (str) => {
  if (!str || (typeof str !== 'string' && typeof str !== 'number')) return false;
  
  // 如果是数字，检查是否是合理的秒数
  if (typeof str === 'number') {
    return str >= 0 && str < 86400; // 一天的秒数
  }
  
  const cleanStr = String(str).trim();
  
  // 纯数字格式 (秒数)
  if (/^\d+s?$/.test(cleanStr)) return true;
  
  // 定义所有支持的时间戳格式
  const timestampPatterns = [
    // 各种括号格式
    /^\[(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)\]$/,           // [H:M:S] 或 [M:S]
    /^\((\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)\)$/,           // (H:M:S) 或 (M:S)
    /^【(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)】$/,           // 【H:M:S】 或 【M:S】
    /^《(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)》$/,           // 《H:M:S》 或 《M:S》
    /^「(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)」$/,           // 「H:M:S」 或 「M:S」
    /^『(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)』$/,           // 『H:M:S』 或 『M:S』
    
    // 无括号格式
    /^\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?$/,                       // H:M:S
    /^\d{1,2}:\d{1,2}(?:\.\d+)?$/,                               // M:S
    
    // 特殊分隔符格式
    /^\d{1,2}[-]\d{1,2}[-]\d{1,2}(?:\.\d+)?$/,                  // H-M-S
    /^\d{1,2}[\s]\d{1,2}[\s]\d{1,2}(?:\.\d+)?$/,                // H M S
    /^\d{1,2}[.,，。]\d{1,2}[.,，。]\d{1,2}(?:\.\d+)?$/,        // H,M,S 或 H.M.S
    
    // 时间范围格式
    /^\[?\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?\s*[-–—]\s*\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?\]?$/,
    
    // YouTube格式
    /^[?&]?t=\d+s?$/,                                            // t=123s 或 ?t=123
  ];
  
  return timestampPatterns.some(pattern => pattern.test(cleanStr));
};

/**
 * 标准化时间戳格式为 [HH:MM:SS]
 * @param {string} timestamp - 原始时间戳
 * @returns {string} - 标准化后的时间戳
 */
export const normalizeTimestamp = (timestamp) => {
  console.log(`[timestampUtils] normalizeTimestamp input: "${timestamp}" (type: ${typeof timestamp})`);
  
  if (!timestamp && timestamp !== 0) {
    console.log(`[timestampUtils] Empty timestamp, returning default [00:00:00]`);
    return '[00:00:00]';
  }
  
  // 如果是数字，直接转换为时间格式
  if (typeof timestamp === 'number') {
    console.log(`[timestampUtils] Input is number, converting to time format`);
    const result = secondsToTimeString(timestamp, true);
    console.log(`[timestampUtils] Number conversion: ${timestamp}s -> "${result}"`);
    return result;
  }
  
  const cleanTimestamp = String(timestamp).trim();
  
  // 如果已经是标准格式则直接返回（支持各种位数）
  const standardFormats = [
    /^\[\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?\]$/,  // [H:M:S] 
    /^\[\d{1,2}:\d{1,2}(?:\.\d+)?\]$/,          // [M:S]
  ];
  
  for (const format of standardFormats) {
    if (format.test(cleanTimestamp)) {
      console.log(`[timestampUtils] Already in standard format, returning: "${cleanTimestamp}"`);
      return cleanTimestamp;
    }
  }
  
  // 检查是否是有效的时间戳格式
  if (!isTimestamp(cleanTimestamp)) {
    console.warn(`[timestampUtils] Invalid timestamp format: "${cleanTimestamp}", returning default`);
    return '[00:00:00]';
  }
  
  // 转换为秒数再转回标准时间戳格式
  console.log(`[timestampUtils] Converting via seconds: "${cleanTimestamp}"`);
  const seconds = timeToSeconds(cleanTimestamp);
  
  if (seconds === 0 && cleanTimestamp !== '0' && !cleanTimestamp.includes('00:00:00')) {
    console.warn(`[timestampUtils] Conversion resulted in 0 seconds, might be parsing error`);
  }
  
  const result = secondsToTimeString(seconds, true);
  console.log(`[timestampUtils] Converted via seconds: "${cleanTimestamp}" -> "${result}" (${seconds}s)`);
  return result;
};

/**
 * 智能时间戳解析 - 尝试从任意文本中提取时间戳
 * @param {string} text - 包含时间戳的文本
 * @returns {Array} - 找到的时间戳数组，每个元素包含 { original, normalized, seconds }
 */
export const extractTimestamps = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const results = [];
  const patterns = [
    // 完整时间戳格式
    /\[(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)\]/g,
    /\((\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)\)/g,
    /【(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)】/g,
    /《(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)》/g,
    
    // 短格式时间戳
    /\[(\d{1,2}:\d{1,2}(?:\.\d+)?)\]/g,
    /\((\d{1,2}:\d{1,2}(?:\.\d+)?)\)/g,
    /【(\d{1,2}:\d{1,2}(?:\.\d+)?)】/g,
    
    // 无括号格式（需要前后有空格或行首行尾）
    /(?:^|\s)(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)(?=\s|$)/g,
    /(?:^|\s)(\d{1,2}:\d{1,2}(?:\.\d+)?)(?=\s|$)/g,
    
    // YouTube格式
    /[?&]t=(\d+)s?/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const original = match[0];
      const timeStr = match[1];
      const seconds = timeToSeconds(timeStr);
      const normalized = normalizeTimestamp(timeStr);
      
      results.push({
        original,
        timeStr,
        normalized,
        seconds,
        index: match.index
      });
    }
  }
  
  // 按位置排序并去重
  return results
    .sort((a, b) => a.index - b.index)
    .filter((item, index, arr) => 
      index === 0 || item.seconds !== arr[index - 1].seconds
    );
};

/**
 * 批量验证时间戳格式
 * @param {Array} timestamps - 时间戳数组
 * @returns {Object} - 验证结果 { valid: [], invalid: [] }
 */
export const validateTimestamps = (timestamps) => {
  const valid = [];
  const invalid = [];
  
  for (const timestamp of timestamps) {
    if (isTimestamp(timestamp)) {
      valid.push({
        original: timestamp,
        normalized: normalizeTimestamp(timestamp),
        seconds: timeToSeconds(timestamp)
      });
    } else {
      invalid.push(timestamp);
    }
  }
  
  return { valid, invalid };
};

export default {
  timeToSeconds,
  secondsToTimeString,
  isTimestamp,
  normalizeTimestamp,
  extractTimestamps,
  validateTimestamps
}; 
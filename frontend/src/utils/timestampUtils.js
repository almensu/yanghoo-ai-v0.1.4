/**
 * 时间戳工具类 - 处理不同格式的时间戳和转换
 */

/**
 * 将时间字符串转换为秒数
 * @param {string} timeStr - 时间字符串，格式可以是 HH:MM:SS、MM:SS 或带方括号 [HH:MM:SS]
 * @returns {number} - 转换后的秒数
 */
export const timeToSeconds = (timeStr) => {
  try {
    if (!timeStr) return 0;
    
    // 移除可能存在的方括号
    let cleanTimeStr = timeStr;
    if (timeStr.startsWith('[') && timeStr.endsWith(']')) {
      cleanTimeStr = timeStr.substring(1, timeStr.length - 1);
    }
    
    // 处理不同的时间格式
    const parts = cleanTimeStr.split(':');
    let hours = 0, minutes = 0, seconds = 0;
    
    if (parts.length === 3) {
      // HH:MM:SS 格式
      [hours, minutes, seconds] = parts;
    } else if (parts.length === 2) {
      // MM:SS 格式
      [minutes, seconds] = parts;
    } else if (parts.length === 1) {
      // 只有秒数
      seconds = parts[0];
    }
    
    // 处理可能的毫秒部分
    let milliseconds = 0;
    if (String(seconds).includes('.')) {
      const secParts = String(seconds).split('.');
      seconds = secParts[0];
      milliseconds = secParts[1] || 0;
      milliseconds = Number(`0.${milliseconds}`);
    }
    
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + milliseconds;
  } catch (error) {
    console.error("时间戳转换错误:", error);
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
  if (!str || typeof str !== 'string') return false;
  
  // 检查带方括号的时间戳 [00:00:00]
  if (str.startsWith('[') && str.endsWith(']')) {
    const timeStr = str.substring(1, str.length - 1);
    return /^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(timeStr);
  }
  
  // 检查不带方括号的时间戳 00:00:00
  return /^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(str) || /^\d{2}:\d{2}(?:\.\d+)?$/.test(str);
};

/**
 * 标准化时间戳格式为 [HH:MM:SS]
 * @param {string} timestamp - 原始时间戳
 * @returns {string} - 标准化后的时间戳
 */
export const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return '[00:00:00]';
  
  // 如果已经是标准格式则直接返回
  if (timestamp.startsWith('[') && timestamp.endsWith(']') && /^\[\d{2}:\d{2}:\d{2}\]$/.test(timestamp)) {
    return timestamp;
  }
  
  // 转换为秒数再转回时间戳格式
  const seconds = timeToSeconds(timestamp);
  return secondsToTimeString(seconds, true);
};

export default {
  timeToSeconds,
  secondsToTimeString,
  isTimestamp,
  normalizeTimestamp
}; 
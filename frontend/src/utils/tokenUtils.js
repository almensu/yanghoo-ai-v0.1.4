/**
 * Utility functions for token counting
 * Provides approximate token counts for text content to help with LLM usage
 */

/**
 * Estimates token count using a simple heuristic
 * This is an approximation - actual token counts may vary by model
 * @param {string} text - The text to count tokens for
 * @returns {number} - Estimated token count
 */
export function estimateTokenCount(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Remove markdown syntax for more accurate counting
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert links to just text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Estimate using word count * 1.3 (common approximation for English)
  // Chinese/Japanese characters typically count as 1 token each
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
  
  // Rough estimation: 
  // - English words: ~1.3 tokens per word
  // - Chinese characters: ~1 token per character
  // - Punctuation and special chars: minimal impact
  const englishTokens = words.length * 1.3;
  const chineseTokens = chineseChars * 1;
  
  return Math.ceil(englishTokens + chineseTokens);
}

/**
 * Formats token count for display
 * @param {number} tokenCount - The token count to format
 * @returns {string} - Formatted token count with K/M suffix if needed
 */
export function formatTokenCount(tokenCount) {
  if (tokenCount < 1000) {
    return `${tokenCount}`;
  } else if (tokenCount < 1000000) {
    return `${(tokenCount / 1000).toFixed(1)}K`;
  } else {
    return `${(tokenCount / 1000000).toFixed(1)}M`;
  }
}

/**
 * Gets a color class based on token count for visual indication
 * @param {number} tokenCount - The token count
 * @returns {string} - CSS class name for color coding
 */
export function getTokenCountColorClass(tokenCount) {
  if (tokenCount < 1000) {
    return 'text-green-600'; // Low token count - green
  } else if (tokenCount < 4000) {
    return 'text-yellow-600'; // Medium token count - yellow
  } else if (tokenCount < 8000) {
    return 'text-orange-600'; // High token count - orange
  } else {
    return 'text-red-600'; // Very high token count - red
  }
} 
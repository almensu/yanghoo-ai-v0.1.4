/**
 * Extraction logic for supported source URLs from arbitrary text.
 */

const SUPPORTED_PATTERNS = [
  // Xiaohongshu
  /https?:\/\/(?:www\.xiaohongshu\.com|xhslink\.com)\/[^\s，,！!]+/,
  // YouTube
  /https?:\/\/(?:www\.youtube\.com|youtu\.be)\/[^\s，,！!]+/,
  // Douyin
  /https?:\/\/(?:v\.douyin\.com|www\.douyin\.com)\/[^\s，,！!]+/,
  // X/Twitter
  /https?:\/\/(?:x\.com|twitter\.com)\/[^\s，,！!]+/,
  // Xiaoyuzhou
  /https?:\/\/www\.xiaoyuzhoufm\.com\/[^\s，,！!]+/
];

/**
 * Extracts the first supported URL from a string.
 * Returns the URL if found, or null otherwise.
 */
export function extractSupportedSourceUrl(input: string): string | null {
  for (const pattern of SUPPORTED_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

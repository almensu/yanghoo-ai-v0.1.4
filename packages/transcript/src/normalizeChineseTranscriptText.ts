import * as OpenCC from 'opencc-js';
import { TranscriptSegment } from '@yanghoo/domain';

// Initialize converter: Traditional to Simplified
// Using 'tw' to 'cn' as a robust default for general Traditional Chinese to Simplified Chinese.
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

/**
 * Normalizes a string to Simplified Chinese.
 */
export function normalizeTranscriptText(text: string): string {
  if (!text) return '';
  return normalizeSimplifiedChineseVariants(converter(text));
}

/**
 * Normalizes transcript segments to Simplified Chinese.
 */
export function normalizeTranscriptSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  return segments.map(segment => ({
    ...segment,
    text: normalizeTranscriptText(segment.text)
  }));
}

function normalizeSimplifiedChineseVariants(text: string): string {
  return text
    .replace(/为什幺/g, '为什么')
    .replace(/干什幺/g, '干什么')
    .replace(/做什幺/g, '做什么')
    .replace(/说什幺/g, '说什么')
    .replace(/问什幺/g, '问什么')
    .replace(/什幺/g, '什么')
    .replace(/怎幺/g, '怎么')
    .replace(/这幺/g, '这么')
    .replace(/那幺/g, '那么')
    .replace(/多幺/g, '多么');
}

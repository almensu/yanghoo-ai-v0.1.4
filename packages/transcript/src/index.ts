import { TranscriptSegment } from '@yanghoo/domain';

export interface TranscriptRefinerOptions {
  maxSentenceLength?: number;
  minSentenceLength?: number;
}

/**
 * Refines raw transcript segments into sentence-like segments.
 */
export function refineTranscriptSentences(
  segments: TranscriptSegment[],
  options: TranscriptRefinerOptions = {}
): TranscriptSegment[] {
  if (segments.length === 0) return [];

  const refined: TranscriptSegment[] = [];
  let current: TranscriptSegment | null = null;
  const sentenceEndRegex = /[.!?。！？]\s*$/;

  for (const segment of segments) {
    const text = segment.text.trim();
    if (!text) continue;

    if (!current) {
      current = { ...segment, text };
    } else {
      current.text += ' ' + text;
      current.end = segment.end;
    }

    // Flush immediately if the current text ends with sentence-ending punctuation
    // or if it exceeds the maximum length
    if (sentenceEndRegex.test(current.text) || current.text.length > (options.maxSentenceLength ?? 200)) {
      refined.push(current);
      current = null;
    }
  }

  if (current) {
    refined.push(current);
  }

  return refined;
}

/**
 * Converts segments to VTT format string.
 */
export function convertToVTT(segments: TranscriptSegment[]): string {
  let vtt = 'WEBVTT\n\n';

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  segments.forEach((s, i) => {
    vtt += `${i + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${s.text}\n\n`;
  });

  return vtt;
}

/**
 * Converts segments to Markdown format string.
 */
export function convertToMarkdown(title: string, segments: TranscriptSegment[]): string {
  let md = `# ${title}\n\n`;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  segments.forEach((s) => {
    md += `**[${formatTime(s.start)}]** ${s.text}\n\n`;
  });

  return md;
}

/**
 * Interface for Audio Extraction.
 */
export async function extractAudioFromVideo(videoPath: string): Promise<string> {
  console.log(`[Transcript] Extracting audio from: ${videoPath}`);
  // Stub: Return a predictable audio path
  return videoPath.replace(/\.[^.]+$/, '.mp3');
}

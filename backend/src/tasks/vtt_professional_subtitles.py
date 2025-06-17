#!/usr/bin/env python3
"""
Professional Subtitle Processor
Converts ASR VTT to Netflix/BBC standard subtitles following professional guidelines.

Standards implemented:
- Netflix Timed Text Style Guide
- BBC Subtitling Guidelines  
- Maximum 2 lines per subtitle
- ≤42 characters per line
- ≤17 CPS (characters per second)
- Proper sentence segmentation
"""

import re
import spacy
from typing import List, Tuple
from dataclasses import dataclass
import textwrap

@dataclass
class Subtitle:
    start_time: float
    end_time: float
    text: str
    line_count: int = 1
    char_count: int = 0
    cps: float = 0.0

class ProfessionalSubtitleProcessor:
    def __init__(self):
        # Load spaCy with lightweight configuration
        try:
            self.nlp = spacy.load("en_core_web_sm", disable=["tagger", "parser", "ner"])
            self.nlp.add_pipe("sentencizer")
            print("✓ Loaded spaCy English model")
        except OSError:
            print("⚠ spaCy model not found, using rule-based segmentation")
            self.nlp = None
        
        # Professional standards
        self.MAX_CHARS_PER_LINE = 42
        self.MAX_LINES = 2
        self.MAX_CPS = 17  # characters per second
        self.MIN_CPS = 12  # for children content
        self.MIN_DURATION = 1.0  # minimum subtitle duration
        self.GAP_BETWEEN_SUBS = 0.15  # 150ms gap
        
        # Abbreviations that shouldn't trigger sentence breaks
        self.ABBREVIATIONS = {
            'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'St.', 'Jr.', 'Sr.', 
            'vs.', 'etc.', 'Inc.', 'Corp.', 'Ltd.', 'Co.', 'U.S.', 'U.K.',
            'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 'CEO', 'CFO', 'CTO'
        }

    def extract_clean_text_from_vtt(self, vtt_content: str) -> List[Tuple[float, float, str]]:
        """Extract clean text segments from VTT, handling accumulated format properly"""
        lines = vtt_content.strip().split('\n')
        segments = []
        i = 0
        
        # Skip header
        while i < len(lines) and (not lines[i].strip() or 
                                  'WEBVTT' in lines[i] or 
                                  'Language:' in lines[i]):
            i += 1
        
        while i < len(lines):
            if not lines[i].strip():
                i += 1
                continue
                
            # Look for timestamp
            timestamp_match = re.match(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})', lines[i])
            if timestamp_match:
                start_str, end_str = timestamp_match.groups()
                start_time = self._parse_time(start_str)
                end_time = self._parse_time(end_str)
                i += 1
                
                # Collect clean text lines
                text_lines = []
                while i < len(lines) and lines[i].strip():
                    line = lines[i].strip()
                    
                    # Skip markup lines
                    if '<' in line or 'align:start' in line:
                        i += 1
                        continue
                    
                    # Skip timestamp lines
                    if re.match(r'\d{2}:\d{2}:\d{2}\.\d{3}', line):
                        break
                    
                    # Clean text
                    if line:
                        text_lines.append(line)
                    i += 1
                
                # Use clean, non-accumulated text
                if text_lines:
                    # Take the first clean line that doesn't look like accumulated text
                    clean_text = text_lines[-1] if text_lines else ""  # Last line is often cleanest
                    
                    # Remove obvious duplicated patterns
                    words = clean_text.split()
                    if len(words) > 10:
                        # Check for internal duplication (common in ASR)
                        mid = len(words) // 2
                        first_half = ' '.join(words[:mid])
                        second_half = ' '.join(words[mid:])
                        
                        # If second half starts similar to first half, it's likely duplicated
                        if second_half.startswith(first_half[:20]):
                            clean_text = second_half  # Use second half which is usually more complete
                    
                    if clean_text and end_time > start_time:
                        segments.append((start_time, end_time, clean_text))
            else:
                i += 1
        
        print(f"✓ Extracted {len(segments)} clean segments")
        # Debug: print first few segments
        for i, (start, end, text) in enumerate(segments[:3]):
            print(f"   Segment {i+1}: {start:.1f}-{end:.1f}s: {text[:100]}...")
        return segments

    def _parse_time(self, time_str: str) -> float:
        """Convert VTT timestamp to seconds"""
        match = re.match(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3})', time_str)
        if not match:
            return 0.0
        h, m, s, ms = map(int, match.groups())
        return h * 3600 + m * 60 + s + ms / 1000

    def _format_time(self, seconds: float) -> str:
        """Convert seconds to VTT timestamp"""
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

    def merge_fragments(self, segments: List[Tuple[float, float, str]], max_gap: float = 1.5) -> List[Tuple[float, float, str]]:
        """Merge fragmented segments into longer meaningful chunks"""
        if not segments:
            return []
        
        merged = []
        current_start, current_end, current_text = segments[0]
        
        for next_start, next_end, next_text in segments[1:]:
            gap = next_start - current_end
            
            # Don't merge if current text is already too long (limit to ~200 chars for natural breaks)
            if len(current_text) > 200:
                merged.append((current_start, current_end, current_text))
                current_start, current_end, current_text = next_start, next_end, next_text
                continue
            
            if gap <= max_gap:
                # Check for text overlap/duplication
                if next_text.startswith(current_text):
                    # Next text includes current, use next
                    current_text = next_text
                elif current_text in next_text:
                    # Current is substring of next, use next
                    current_text = next_text
                elif self._texts_overlap(current_text, next_text):
                    # Smart merge avoiding duplication
                    current_text = self._smart_merge_texts(current_text, next_text)
                else:
                    # Different content, concatenate with sentence boundary check
                    combined = f"{current_text} {next_text}"
                    # If combined text looks like it ends a sentence, stop merging
                    if len(combined) > 150 and re.search(r'[.!?]\s*$', current_text):
                        merged.append((current_start, current_end, current_text))
                        current_start, current_end, current_text = next_start, next_end, next_text
                        continue
                    else:
                        current_text = combined
                
                current_end = next_end
            else:
                # Gap too large, save current and start new
                merged.append((current_start, current_end, current_text))
                current_start, current_end, current_text = next_start, next_end, next_text
        
        # Add the last segment
        merged.append((current_start, current_end, current_text))
        
        print(f"✓ Merged {len(segments)} fragments into {len(merged)} segments")
        return merged

    def _texts_overlap(self, text1: str, text2: str) -> bool:
        """Check if two texts have significant overlap"""
        words1 = text1.split()
        words2 = text2.split()
        
        if len(words1) < 3 or len(words2) < 3:
            return False
        
        # Check if last 3 words of text1 match first 3 words of text2
        return words1[-3:] == words2[:3]

    def _smart_merge_texts(self, text1: str, text2: str) -> str:
        """Intelligently merge overlapping texts"""
        words1 = text1.split()
        words2 = text2.split()
        
        # Find overlap point
        for i in range(min(len(words1), len(words2)), 0, -1):
            if words1[-i:] == words2[:i]:
                # Merge at overlap point
                return " ".join(words1 + words2[i:])
        
        # No overlap found, simple concatenation
        return f"{text1} {text2}"

    def segment_into_sentences(self, text: str) -> List[str]:
        """Segment text into proper sentences using spaCy or rules"""
        if self.nlp:
            # Use spaCy sentencizer
            doc = self.nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
        else:
            # Fallback to rule-based segmentation
            sentences = self._rule_based_sentence_split(text)
        
        return sentences

    def _rule_based_sentence_split(self, text: str) -> List[str]:
        """Rule-based sentence splitting with abbreviation protection"""
        # Protect abbreviations
        protected_text = text
        for abbr in self.ABBREVIATIONS:
            protected_text = protected_text.replace(abbr, abbr.replace('.', '<!DOT!>'))
        
        # Split on sentence endings
        sentences = re.split(r'[.!?]+\s+', protected_text)
        
        # Restore abbreviations and clean up
        result = []
        for sentence in sentences:
            sentence = sentence.replace('<!DOT!>', '.').strip()
            if sentence:
                result.append(sentence)
        
        return result

    def create_professional_subtitles(self, segments: List[Tuple[float, float, str]]) -> List[Subtitle]:
        """Create professional subtitles following Netflix/BBC standards"""
        subtitles = []
        current_time = 0.0
        
        for start_time, end_time, text in segments:
            # Segment text into sentences
            sentences = self.segment_into_sentences(text)
            
            for sentence in sentences:
                # Calculate timing
                char_count = len(sentence)
                min_duration = max(char_count / self.MAX_CPS, self.MIN_DURATION)
                
                # Format text with proper line breaks
                formatted_text = self._format_subtitle_text(sentence)
                lines = formatted_text.split('\n')
                
                # Calculate actual character count and CPS
                actual_char_count = sum(len(line) for line in lines)
                actual_cps = actual_char_count / min_duration
                
                subtitle = Subtitle(
                    start_time=current_time,
                    end_time=current_time + min_duration,
                    text=formatted_text,
                    line_count=len(lines),
                    char_count=actual_char_count,
                    cps=actual_cps
                )
                
                subtitles.append(subtitle)
                current_time += min_duration + self.GAP_BETWEEN_SUBS
        
        print(f"✓ Created {len(subtitles)} professional subtitles")
        return subtitles

    def _format_subtitle_text(self, text: str) -> str:
        """Format text according to Netflix/BBC line break standards"""
        # Clean up text
        text = re.sub(r'\s+', ' ', text.strip())
        
        # If text is short enough for one line
        if len(text) <= self.MAX_CHARS_PER_LINE:
            return text
        
        # Use textwrap for basic line breaking
        lines = textwrap.wrap(
            text, 
            width=self.MAX_CHARS_PER_LINE,
            break_long_words=False,
            break_on_hyphens=False
        )
        
        # Limit to 2 lines max
        if len(lines) > self.MAX_LINES:
            # Redistribute text more evenly
            words = text.split()
            mid_point = len(words) // 2
            
            # Find better break point near middle
            for i in range(mid_point - 2, mid_point + 3):
                if i > 0 and i < len(words):
                    line1 = ' '.join(words[:i])
                    line2 = ' '.join(words[i:])
                    
                    if (len(line1) <= self.MAX_CHARS_PER_LINE and 
                        len(line2) <= self.MAX_CHARS_PER_LINE):
                        return f"{line1}\n{line2}"
            
            # Fallback: truncate to fit
            lines = lines[:self.MAX_LINES]
        
        # Apply Netflix pyramid style (bottom line slightly longer)
        if len(lines) == 2 and len(lines[0]) > len(lines[1]):
            words = (lines[0] + ' ' + lines[1]).split()
            # Redistribute for pyramid shape
            for split_point in range(len(words)//2 - 1, len(words)//2 + 2):
                if split_point > 0:
                    line1 = ' '.join(words[:split_point])
                    line2 = ' '.join(words[split_point:])
                    if (len(line1) <= self.MAX_CHARS_PER_LINE and 
                        len(line2) <= self.MAX_CHARS_PER_LINE and
                        len(line2) >= len(line1)):
                        lines = [line1, line2]
                        break
        
        return '\n'.join(lines)

    def generate_vtt(self, subtitles: List[Subtitle]) -> str:
        """Generate professional VTT file"""
        lines = ["WEBVTT", ""]
        
        for i, subtitle in enumerate(subtitles, 1):
            lines.append(str(i))
            start_time = self._format_time(subtitle.start_time)
            end_time = self._format_time(subtitle.end_time)
            lines.append(f"{start_time} --> {end_time}")
            lines.append(subtitle.text)
            lines.append("")
        
        return '\n'.join(lines)

    def process_vtt_file(self, input_path: str, output_path: str = None):
        """Process VTT file to professional standards"""
        if output_path is None:
            output_path = input_path.replace('.vtt', '_professional.vtt')
        
        print(f"\n🎬 Processing VTT: {input_path}")
        
        # Read input
        with open(input_path, 'r', encoding='utf-8') as f:
            vtt_content = f.read()
        
        # Step 1: Extract clean segments
        segments = self.extract_clean_text_from_vtt(vtt_content)
        
        # Step 2: Merge fragments
        merged_segments = self.merge_fragments(segments)
        
        # Step 3: Create professional subtitles
        subtitles = self.create_professional_subtitles(merged_segments)
        
        # Step 4: Generate output
        output_vtt = self.generate_vtt(subtitles)
        
        # Save result
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output_vtt)
        
        # Print statistics
        self._print_stats(subtitles, output_path)
        
        return output_path

    def _print_stats(self, subtitles: List[Subtitle], output_path: str):
        """Print processing statistics"""
        total_subs = len(subtitles)
        avg_cps = sum(sub.cps for sub in subtitles) / total_subs if total_subs > 0 else 0
        long_lines = sum(1 for sub in subtitles if sub.char_count > self.MAX_CHARS_PER_LINE * sub.line_count)
        high_cps = sum(1 for sub in subtitles if sub.cps > self.MAX_CPS)
        
        print(f"\n📊 Professional Subtitle Statistics:")
        print(f"   • Total subtitles: {total_subs}")
        print(f"   • Average CPS: {avg_cps:.1f} (target: ≤{self.MAX_CPS})")
        print(f"   • Lines exceeding length: {long_lines} ({long_lines/total_subs*100:.1f}%)")
        print(f"   • Subtitles with high CPS: {high_cps} ({high_cps/total_subs*100:.1f}%)")
        print(f"   ✅ Saved to: {output_path}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python vtt_professional_subtitles.py <input.vtt> [output.vtt]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    processor = ProfessionalSubtitleProcessor()
    processor.process_vtt_file(input_file, output_file) 
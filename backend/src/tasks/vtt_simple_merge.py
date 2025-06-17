#!/usr/bin/env python3
"""
Simple VTT merging script to combine short fragments into longer, more natural segments.
Handles the accumulated text format properly without duplication.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class VTTSegment:
    start_time: float
    end_time: float
    text: str

def parse_time(time_str: str) -> float:
    """Convert VTT time to seconds"""
    match = re.match(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3})', time_str)
    if not match:
        return 0.0
    h, m, s, ms = map(int, match.groups())
    return h * 3600 + m * 60 + s + ms / 1000

def format_time(seconds: float) -> str:
    """Convert seconds to VTT time"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def extract_clean_segments(vtt_content: str) -> List[VTTSegment]:
    """Extract clean segments from VTT, removing duplicates"""
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
            start_time = parse_time(start_str)
            end_time = parse_time(end_str)
            i += 1
            
            # Get the last (most complete) text line for this timestamp
            text_lines = []
            while i < len(lines) and lines[i].strip():
                line = lines[i].strip()
                
                # Skip lines with markup
                if '<' in line or 'align:start' in line:
                    i += 1
                    continue
                    
                # Skip lines that are timestamps
                if re.match(r'\d{2}:\d{2}:\d{2}\.\d{3}', line):
                    break
                    
                # This is clean text
                if line:
                    text_lines.append(line)
                i += 1
            
            # Take the longest text (most complete)
            if text_lines:
                longest_text = max(text_lines, key=len)
                if longest_text:
                    segments.append(VTTSegment(start_time, end_time, longest_text))
        else:
            i += 1
    
    return segments

def merge_segments(segments: List[VTTSegment], max_gap: float = 3.0) -> List[VTTSegment]:
    """Merge segments with small gaps between them"""
    if not segments:
        return []
    
    merged = []
    current = segments[0]
    
    for next_seg in segments[1:]:
        gap = next_seg.start_time - current.end_time
        
        if gap <= max_gap:
            # Merge segments
            # Avoid text duplication by checking if next text is continuation
            if next_seg.text.startswith(current.text):
                # Next text includes current text, use the longer one
                current = VTTSegment(current.start_time, next_seg.end_time, next_seg.text)
            elif current.text in next_seg.text:
                # Current text is substring of next, use next
                current = VTTSegment(current.start_time, next_seg.end_time, next_seg.text)
            else:
                # Different text, concatenate
                combined_text = current.text + " " + next_seg.text
                current = VTTSegment(current.start_time, next_seg.end_time, combined_text)
        else:
            # Gap too large, save current and start new
            merged.append(current)
            current = next_seg
    
    # Add the last segment
    merged.append(current)
    return merged

def create_clean_vtt(segments: List[VTTSegment]) -> str:
    """Create clean VTT content"""
    lines = ["WEBVTT", ""]
    
    for i, seg in enumerate(segments, 1):
        lines.append(str(i))
        lines.append(f"{format_time(seg.start_time)} --> {format_time(seg.end_time)}")
        lines.append(seg.text)
        lines.append("")
    
    return "\n".join(lines)

def process_vtt_file(input_path: str, output_path: str, max_gap: float = 3.0):
    """Process a VTT file"""
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"Processing {input_path}...")
    
    # Extract segments
    segments = extract_clean_segments(content)
    print(f"Extracted {len(segments)} segments")
    
    # Merge segments
    merged = merge_segments(segments, max_gap)
    print(f"Merged to {len(merged)} segments")
    
    # Create output
    output_content = create_clean_vtt(merged)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_content)
    
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vtt_simple_merge.py <input_file> [output_file] [max_gap_seconds]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.vtt', '_merged.vtt')
    max_gap = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
    
    process_vtt_file(input_file, output_file, max_gap) 
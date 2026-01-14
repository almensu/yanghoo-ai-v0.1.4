"""
VTT to SRT Converter

Converts WebVTT subtitle files to SRT format.
Handles timestamp conversion and sequential numbering.

Author: YangHoo AI
Date: 2026-01-14
"""

import re
import os
import sys
import logging
from pathlib import Path
from typing import List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# VTT timestamp pattern: HH:MM:SS.mmm --> HH:MM:SS.mmm
VTT_TIMESTAMP_PATTERN = re.compile(r'(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})')

# HTML tags to remove
HTML_TAGS = re.compile(r'<[^>]+>')


def parse_vtt_file(vtt_path: str) -> List[Tuple[str, str, str]]:
    """
    Parse VTT file and extract subtitle blocks.

    Args:
        vtt_path: Path to VTT file

    Returns:
        List of tuples (start_time, end_time, text)
        Times are in SRT format: HH:MM:SS,mmm

    Raises:
        FileNotFoundError: If VTT file doesn't exist
        ValueError: If VTT file is invalid
    """
    if not os.path.exists(vtt_path):
        raise FileNotFoundError(f"VTT file not found: {vtt_path}")

    with open(vtt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove VTT header
    content = re.sub(r'WEBVTT.*?\n\n', '', content, flags=re.DOTALL)

    # Split into subtitle blocks
    blocks = re.split(r'\n\s*\n', content.strip())

    subtitles = []

    for block in blocks:
        lines = block.strip().split('\n')
        if not lines:
            continue

        # Find timestamp line
        timestamp_line = None
        text_lines = []

        for i, line in enumerate(lines):
            if VTT_TIMESTAMP_PATTERN.match(line.strip()):
                timestamp_line = line.strip()
                text_lines = lines[i+1:]
                break

        if not timestamp_line:
            continue

        # Parse timestamp
        match = VTT_TIMESTAMP_PATTERN.match(timestamp_line)
        if not match:
            continue

        start_hms = match.group(1)
        start_ms = match.group(2)
        end_hms = match.group(3)
        end_ms = match.group(4)

        # Convert to SRT format (comma instead of dot)
        start_time_srt = f"{start_hms},{start_ms}"
        end_time_srt = f"{end_hms},{end_ms}"

        # Clean text
        text = '\n'.join(text_lines).strip()
        # Remove HTML tags
        text = HTML_TAGS.sub('', text)
        # Remove NOTE and STYLE blocks
        text = re.sub(r'NOTE\s*.*?$', '', text, flags=re.MULTILINE)
        text = re.sub(r'STYLE\s*.*?$', '', text, flags=re.MULTILINE)
        # Replace newlines with spaces for cleaner text
        text = re.sub(r'\n+', ' ', text).strip()

        if text:
            subtitles.append((start_time_srt, end_time_srt, text))

    return subtitles


def deduplicate_overlaps(subtitles: List[Tuple[str, str, str]]) -> List[Tuple[str, str, str]]:
    """
    Remove starting overlaps between consecutive subtitle segments.
    YouTube's auto-generated VTT files are cumulative, so we need to deduplicate.

    Args:
        subtitles: List of (start_time, end_time, text) tuples

    Returns:
        Deduplicated list of subtitles
    """
    if not subtitles:
        return []

    deduplicated = [subtitles[0]]  # Keep the first segment as is

    for i in range(1, len(subtitles)):
        prev_time, prev_end, prev_text = deduplicated[-1]
        current_time, current_end, current_text = subtitles[i]

        # Check if current text starts with previous text
        if prev_text and current_text != prev_text and current_text.startswith(prev_text):
            # Remove the overlapping part from the start of the current text
            new_text = current_text[len(prev_text):].strip()
            # Only add if there's remaining non-empty text
            if new_text:
                deduplicated.append((current_time, current_end, new_text))
            # else: segment was fully overlapped, skip it
        # Avoid adding exact duplicates
        elif current_text != prev_text:
            deduplicated.append((current_time, current_end, current_text))

    return deduplicated


def convert_vtt_to_srt(vtt_path: str, srt_path: str) -> int:
    """
    Convert VTT file to SRT format with deduplication.

    Args:
        vtt_path: Path to input VTT file
        srt_path: Path to output SRT file

    Returns:
        Number of subtitle blocks converted

    Raises:
        FileNotFoundError: If VTT file doesn't exist
        ValueError: If VTT file is invalid
        IOError: If unable to write SRT file
    """
    logger.info(f"Converting VTT to SRT: {vtt_path} -> {srt_path}")

    # Parse VTT file
    subtitles = parse_vtt_file(vtt_path)

    if not subtitles:
        raise ValueError(f"No valid subtitles found in VTT file: {vtt_path}")

    logger.info(f"Parsed {len(subtitles)} subtitle blocks from VTT")

    # Deduplicate overlaps
    deduplicated = deduplicate_overlaps(subtitles)
    logger.info(f"Deduplicated to {len(deduplicated)} unique subtitle blocks")

    # Generate SRT content
    srt_lines = []

    for i, (start_time, end_time, text) in enumerate(deduplicated, 1):
        srt_lines.append(str(i))
        srt_lines.append(f"{start_time} --> {end_time}")
        srt_lines.append(text)
        srt_lines.append("")  # Empty line between subtitles

    # Write SRT file
    srt_content = '\n'.join(srt_lines)

    output_dir = os.path.dirname(srt_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    with open(srt_path, 'w', encoding='utf-8') as f:
        f.write(srt_content)

    logger.info(f"Successfully converted {len(deduplicated)} subtitles to SRT format")

    return len(deduplicated)


def main():
    """Command-line interface for VTT to SRT conversion."""
    if len(sys.argv) != 3:
        print("Usage: python convert_vtt_to_srt.py <vtt_input_path> <srt_output_path>")
        print("\nExample:")
        print("  python convert_vtt_to_srt.py transcript_en.vtt transcript_en.srt")
        sys.exit(1)

    vtt_path = sys.argv[1]
    srt_path = sys.argv[2]

    try:
        count = convert_vtt_to_srt(vtt_path, srt_path)
        print(f"✓ Successfully converted {count} subtitles")
        print(f"  Input:  {vtt_path}")
        print(f"  Output: {srt_path}")
        sys.exit(0)
    except FileNotFoundError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except IOError as e:
        print(f"✗ Error writing SRT file: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

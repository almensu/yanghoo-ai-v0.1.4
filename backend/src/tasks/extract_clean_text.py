"""
Clean Text Extractor for VTT/SRT Files

Extracts pure text content from subtitle files, removing all timestamps,
numbering, and formatting. Outputs clean, paragraph-organized text.

Author: YangHoo AI
Date: 2026-01-14
"""

import re
import os
import sys
import logging
from pathlib import Path
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# VTT timestamp pattern: HH:MM:SS.mmm --> HH:MM:SS.mmm
VTT_TIMESTAMP_PATTERN = re.compile(r'^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}')

# SRT timestamp pattern: HH:MM:SS,mmm --> HH:MM:SS,mmm
SRT_TIMESTAMP_PATTERN = re.compile(r'^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}')

# SRT subtitle number pattern
SRT_NUMBER_PATTERN = re.compile(r'^\d+$')

# HTML tags to remove
HTML_TAGS = re.compile(r'<[^>]+>')

# VTT header pattern
VTT_HEADER = re.compile(r'WEBVTT', re.IGNORECASE)


def detect_format(file_path: str) -> str:
    """
    Detect subtitle file format (VTT or SRT).

    Args:
        file_path: Path to subtitle file

    Returns:
        'vtt', 'srt', or 'unknown'
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        first_line = f.readline().strip()

    if VTT_HEADER.match(first_line):
        return 'vtt'
    elif first_line.isdigit():
        return 'srt'
    else:
        return 'unknown'


def parse_vtt_text(vtt_path: str) -> List[str]:
    """
    Parse VTT file and extract text content only with deduplication.

    Args:
        vtt_path: Path to VTT file

    Returns:
        List of text paragraphs
    """
    if not os.path.exists(vtt_path):
        raise FileNotFoundError(f"VTT file not found: {vtt_path}")

    with open(vtt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove VTT header
    content = VTT_HEADER.sub('', content)

    # Split into blocks and extract text
    paragraphs = []
    lines = content.split('\n')

    current_paragraph = []

    for line in lines:
        line = line.strip()

        # Skip empty lines
        if not line:
            if current_paragraph:
                text = ' '.join(current_paragraph).strip()
                if text:
                    paragraphs.append(text)
                current_paragraph = []
            continue

        # Skip timestamp lines
        if VTT_TIMESTAMP_PATTERN.match(line):
            if current_paragraph:
                text = ' '.join(current_paragraph).strip()
                if text:
                    paragraphs.append(text)
                current_paragraph = []
            continue

        # Skip NOTE and STYLE blocks
        if line.startswith('NOTE') or line.startswith('STYLE'):
            continue

        # Remove HTML tags and add to current paragraph
        clean_line = HTML_TAGS.sub('', line)
        if clean_line:
            current_paragraph.append(clean_line)

    # Don't forget the last paragraph
    if current_paragraph:
        text = ' '.join(current_paragraph).strip()
        if text:
            paragraphs.append(text)

    # Deduplicate overlaps (similar to merge_vtt.py)
    return deduplicate_paragraphs(paragraphs)


def deduplicate_paragraphs(paragraphs: List[str]) -> List[str]:
    """
    Remove overlapping paragraphs (cumulative VTT segments).

    Args:
        paragraphs: List of text paragraphs

    Returns:
        Deduplicated list of paragraphs
    """
    if not paragraphs:
        return []

    deduplicated = [paragraphs[0]]

    for i in range(1, len(paragraphs)):
        prev_text = deduplicated[-1]
        current_text = paragraphs[i]

        # Check if current text starts with previous text
        if prev_text and current_text != prev_text and current_text.startswith(prev_text):
            # Remove the overlapping part
            new_text = current_text[len(prev_text):].strip()
            if new_text:
                deduplicated.append(new_text)
        elif current_text != prev_text:
            deduplicated.append(current_text)

    return deduplicated


def parse_srt_text(srt_path: str) -> List[str]:
    """
    Parse SRT file and extract text content only.

    Args:
        srt_path: Path to SRT file

    Returns:
        List of text paragraphs
    """
    if not os.path.exists(srt_path):
        raise FileNotFoundError(f"SRT file not found: {srt_path}")

    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into blocks
    blocks = re.split(r'\n\s*\n', content.strip())

    paragraphs = []

    for block in blocks:
        lines = block.strip().split('\n')
        text_lines = []

        for line in lines:
            line = line.strip()

            # Skip empty lines, numbers, and timestamps
            if not line:
                continue
            if SRT_NUMBER_PATTERN.match(line):
                continue
            if SRT_TIMESTAMP_PATTERN.match(line):
                continue

            # Remove HTML tags and add to text
            clean_line = HTML_TAGS.sub('', line)
            if clean_line:
                text_lines.append(clean_line)

        if text_lines:
            text = ' '.join(text_lines).strip()
            if text:
                paragraphs.append(text)

    return paragraphs


def extract_clean_text(subtitle_path: str, output_path: str) -> int:
    """
    Extract clean text from subtitle file (VTT or SRT).

    Args:
        subtitle_path: Path to input VTT or SRT file
        output_path: Path to output text file

    Returns:
        Number of paragraphs extracted

    Raises:
        FileNotFoundError: If subtitle file doesn't exist
        ValueError: If subtitle file format is unknown
        IOError: If unable to write output file
    """
    logger.info(f"Extracting clean text: {subtitle_path} -> {output_path}")

    # Detect format
    format_type = detect_format(subtitle_path)

    if format_type == 'unknown':
        raise ValueError(f"Unknown subtitle format: {subtitle_path}")

    # Parse based on format
    if format_type == 'vtt':
        paragraphs = parse_vtt_text(subtitle_path)
    else:  # srt
        paragraphs = parse_srt_text(subtitle_path)

    if not paragraphs:
        raise ValueError(f"No valid text content found in: {subtitle_path}")

    # Write clean text file
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        # Write paragraphs with double newline between them
        f.write('\n\n'.join(paragraphs))
        f.write('\n')  # Final newline

    logger.info(f"Successfully extracted {len(paragraphs)} paragraphs")

    return len(paragraphs)


def main():
    """Command-line interface for clean text extraction."""
    if len(sys.argv) != 3:
        print("Usage: python extract_clean_text.py <subtitle_input_path> <text_output_path>")
        print("\nSupported formats: VTT, SRT")
        print("\nExamples:")
        print("  python extract_clean_text.py transcript_en.vtt clean_text_en.txt")
        print("  python extract_clean_text.py transcript_en.srt clean_text_en.txt")
        sys.exit(1)

    subtitle_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        count = extract_clean_text(subtitle_path, output_path)
        print(f"✓ Successfully extracted {count} paragraphs")
        print(f"  Input:  {subtitle_path}")
        print(f"  Output: {output_path}")
        sys.exit(0)
    except FileNotFoundError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except IOError as e:
        print(f"✗ Error writing output file: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

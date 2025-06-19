import re
import sys
from datetime import timedelta
import os # Import os for path checks

# Sentinel value for missing input files
MISSING_SENTINEL = "MISSING"

def parse_srt(srt_file):
    """Parse SRT file and extract timestamps and text."""
    # Check if the file exists before trying to open
    if not os.path.exists(srt_file):
        print(f"Warning: SRT file not found at {srt_file}, skipping.", file=sys.stderr)
        return []
    
    try:
        with open(srt_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading SRT file {srt_file}: {e}", file=sys.stderr)
        return []
    
    # Split by double newlines to get subtitle blocks
    blocks = content.strip().split('\n\n')
    parsed = []
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue
            
        try:
            # Parse subtitle number (first line)
            subtitle_num = int(lines[0])
        except ValueError:
            continue
            
        # Parse timestamp (second line)
        if '-->' not in lines[1]:
            continue
            
        time_parts = lines[1].split(' --> ')
        if len(time_parts) != 2:
            continue
            
        # Extract time without milliseconds for simplified format
        start_time = time_parts[0].strip().split(',')[0]  # Remove milliseconds
        
        # Parse text (remaining lines)
        text = '\n'.join(lines[2:]).strip()
        
        # Only add if text is not empty after stripping
        if text:
            parsed.append((start_time, text))
            
    return parsed

def deduplicate_overlaps(content_list):
    """Remove starting overlaps between consecutive segments."""
    if not content_list:
        return []
    
    deduplicated = [] 
    if content_list: # Ensure list is not empty before accessing index 0
        deduplicated.append(content_list[0]) # Keep the first segment as is
        
    for i in range(1, len(content_list)):
        # Compare with the last added segment in deduplicated list
        if not deduplicated: # Should not happen if content_list was not empty, but safety check
             deduplicated.append(content_list[i])
             continue
             
        prev_time, prev_text = deduplicated[-1]
        current_time, current_text = content_list[i]
        
        # Simple check: if current text starts with previous text and prev_text is not empty
        # Also check if prev_text is not identical to current_text to avoid duplicate lines being added as empty strings
        if prev_text and current_text != prev_text and current_text.startswith(prev_text):
             # Remove the overlapping part from the start of the current text
            new_text = current_text[len(prev_text):].strip()
            # Only add if there's remaining non-empty text
            if new_text:
                 deduplicated.append((current_time, new_text))
            # else: segment was fully overlapped or only contained the overlap, skip it
        # Avoid adding exact duplicates
        elif current_text != prev_text: 
             deduplicated.append((current_time, current_text)) # No overlap or different start
            
    return deduplicated

def create_merged_doc(en_srt_path, zh_srt_path, output_file):
    """Create a merged markdown document with both languages."""
    en_content_raw = parse_srt(en_srt_path) if en_srt_path != MISSING_SENTINEL else []
    zh_content_raw = parse_srt(zh_srt_path) if zh_srt_path != MISSING_SENTINEL else []
    
    # Deduplicate overlaps for each language separately
    en_content = deduplicate_overlaps(en_content_raw)
    zh_content = deduplicate_overlaps(zh_content_raw)
    
    if not en_content and not zh_content:
        print("Error: No valid SRT content found or remaining after deduplication.", file=sys.stderr)
        # Create an empty file or error out?
        with open(output_file, 'w', encoding='utf-8') as f:
             f.write("# Bilingual Transcript / 双语字幕\n\nError: No valid input SRT files found or content parsed.\n")
        return # Or sys.exit(1) if we want to indicate failure more strongly

    # Create a time-aligned mapping
    merged = {}
    for time, text in en_content:
        if time not in merged:
            merged[time] = {"en": "", "zh": ""}
        merged[time]["en"] = text
    
    for time, text in zh_content:
        if time not in merged:
            merged[time] = {"en": "", "zh": ""}
        merged[time]["zh"] = text
    
    # Sort by timestamp
    timestamps = sorted(merged.keys())
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Bilingual Transcript / 双语字幕\n\n")
            for time in timestamps:
                f.write(f"## [{time}]\n\n")
                # Only write if content exists
                if merged[time].get('en'):
                    f.write(f"**EN**: {merged[time]['en']}\n\n")
                if merged[time].get('zh'):
                     f.write(f"**中文**: {merged[time]['zh']}\n\n")
                f.write("---\n\n")
    except Exception as e:
         print(f"Error writing merged file {output_file}: {e}", file=sys.stderr)
         sys.exit(1) # Exit with error if writing fails

def create_parallel_doc(en_srt_path, zh_srt_path, output_file):
    """Create a parallel bilingual markdown table."""
    en_content_raw = parse_srt(en_srt_path) if en_srt_path != MISSING_SENTINEL else []
    zh_content_raw = parse_srt(zh_srt_path) if zh_srt_path != MISSING_SENTINEL else []
    
    # Deduplicate overlaps for each language separately
    en_content = deduplicate_overlaps(en_content_raw)
    zh_content = deduplicate_overlaps(zh_content_raw)
    
    if not en_content and not zh_content:
        print("Error: No valid SRT content found or remaining after deduplication.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
             f.write("# Bilingual Transcript / 双语字幕\n\nError: No valid input SRT files found or content parsed.\n")
        return

    # Create a time-aligned mapping
    merged = {}
    for time, text in en_content:
        if time not in merged:
            merged[time] = {"en": "", "zh": ""}
        merged[time]["en"] = text
    
    for time, text in zh_content:
        if time not in merged:
            merged[time] = {"en": "", "zh": ""}
        merged[time]["zh"] = text
    
    # Sort by timestamp
    timestamps = sorted(merged.keys())
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Bilingual Transcript / 双语字幕\n\n")
            f.write("| Time | English | 中文 |\n")
            f.write("|------|---------|------|\n")
            for time in timestamps:
                # Get text, default to empty string if missing
                en_text = merged[time].get('en', '')
                zh_text = merged[time].get('zh', '')
                # Escape pipe characters within table cells
                en_text_escaped = en_text.replace('|', '\\|')
                zh_text_escaped = zh_text.replace('|', '\\|')
                f.write(f"| [{time}] | {en_text_escaped} | {zh_text_escaped} |\n")
    except Exception as e:
         print(f"Error writing parallel file {output_file}: {e}", file=sys.stderr)
         sys.exit(1) # Exit with error if writing fails

def create_en_only_doc(en_srt_path, output_file):
    """Create an English-only markdown document without timestamps."""
    en_content_raw = parse_srt(en_srt_path) if en_srt_path != MISSING_SENTINEL else []
    
    en_content = deduplicate_overlaps(en_content_raw)
    
    if not en_content:
        print("Error: No valid English SRT content found or remaining after deduplication.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# English Transcript\n\nError: No valid English content found.\n")
        return
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# English Transcript\n\n")
            for _time, text in en_content:
                f.write(f"{text.strip()}\n\n") # Corrected newline handling
    except Exception as e:
        print(f"Error writing English-only file {output_file}: {e}", file=sys.stderr)
        sys.exit(1)

def create_en_only_doc_with_timestamp(en_srt_path, output_file):
    """Create an English-only markdown document with timestamps."""
    en_content_raw = parse_srt(en_srt_path) if en_srt_path != MISSING_SENTINEL else []
    en_content = deduplicate_overlaps(en_content_raw)

    if not en_content:
        print("Error: No valid English SRT content found or remaining after deduplication for timestamped output.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# English Transcript (with Timestamps)\n\nError: No valid English content found.\n")
        return

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# English Transcript (with Timestamps)\n\n")
            for time, text in en_content:
                f.write(f"## [{time}]\n\n")
                f.write(f"**EN**: {text.strip()}\n\n")
                f.write("---\n\n")
    except Exception as e:
        print(f"Error writing English-only file with timestamps {output_file}: {e}", file=sys.stderr)
        sys.exit(1)

def create_zh_only_doc(zh_srt_path, output_file):
    """Create a Chinese-only markdown document without timestamps."""
    zh_content_raw = parse_srt(zh_srt_path) if zh_srt_path != MISSING_SENTINEL else []
    
    zh_content = deduplicate_overlaps(zh_content_raw)
    
    if not zh_content:
        print("Error: No valid Chinese SRT content found or remaining after deduplication.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# 中文字幕\n\nError: 未找到有效的中文内容。\n")
        return
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# 中文字幕\n\n")
            for _time, text in zh_content:
                f.write(f"{text.strip()}\n\n") # Corrected newline handling
    except Exception as e:
        print(f"Error writing Chinese-only file {output_file}: {e}", file=sys.stderr)
        sys.exit(1)

def create_zh_only_doc_with_timestamp(zh_srt_path, output_file):
    """Create a Chinese-only markdown document with timestamps."""
    zh_content_raw = parse_srt(zh_srt_path) if zh_srt_path != MISSING_SENTINEL else []
    zh_content = deduplicate_overlaps(zh_content_raw)

    if not zh_content:
        print("Error: No valid Chinese SRT content found or remaining after deduplication for timestamped output.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# 中文逐字稿 (带时间戳)\n\nError: 未找到有效的中文内容。\n")
        return

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# 中文逐字稿 (带时间戳)\n\n")
            for time, text in zh_content:
                f.write(f"## [{time}]\n\n")
                f.write(f"**中文**: {text.strip()}\n\n")
                f.write("---\n\n")
    except Exception as e:
        print(f"Error writing Chinese-only file with timestamps {output_file}: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    # Expect 5-6 arguments: script_name, en_srt, zh_srt, format, output_file, [use_segmented]
    if len(sys.argv) not in [5, 6]:
        print(f"Usage: python {os.path.basename(__file__)} <en_srt_path|{MISSING_SENTINEL}> <zh_srt_path|{MISSING_SENTINEL}> <format> <output_abs_path> [use_segmented]")
        print("Format options: merged, parallel, en_only, zh_only, en_only_timestamp, zh_only_timestamp, all")
        print("use_segmented: true/false - whether to use *_segmented.srt files if available (default: false)")
        sys.exit(1)
    
    en_srt_path = sys.argv[1]
    zh_srt_path = sys.argv[2]
    format_type = sys.argv[3]
    output_file = sys.argv[4] # This is now the absolute output path
    use_segmented = len(sys.argv) > 5 and sys.argv[5].lower() == 'true'
    
    # Check for segmented versions if requested (not implemented for SRT yet)
    # if use_segmented and en_srt_path != MISSING_SENTINEL:
    #     segmented_en = en_srt_path.replace('.srt', '_segmented.srt')
    #     if os.path.exists(segmented_en):
    #         print(f"Using segmented English SRT: {segmented_en}")
    #         en_srt_path = segmented_en
    
    # if use_segmented and zh_srt_path != MISSING_SENTINEL:
    #     segmented_zh = zh_srt_path.replace('.srt', '_segmented.srt')
    #     if os.path.exists(segmented_zh):
    #         print(f"Using segmented Chinese SRT: {segmented_zh}")
    #         zh_srt_path = segmented_zh
    
    # Basic validation
    if en_srt_path == MISSING_SENTINEL and zh_srt_path == MISSING_SENTINEL:
        print(f"Error: At least one input SRT path must be provided (not {MISSING_SENTINEL}).", file=sys.stderr)
        sys.exit(1)
        
    if format_type not in ['merged', 'parallel', 'en_only', 'zh_only', 'en_only_timestamp', 'zh_only_timestamp', 'all']:
         print(f"Error: Invalid format '{format_type}'. Choose from: merged, parallel, en_only, zh_only, en_only_timestamp, zh_only_timestamp, all", file=sys.stderr)
         sys.exit(1)

    # Validate language-specific formats have matching input files
    if format_type == 'en_only' and en_srt_path == MISSING_SENTINEL:
        print("Error: Cannot create English-only output with missing English SRT.", file=sys.stderr)
        sys.exit(1)

    if format_type == 'en_only_timestamp' and en_srt_path == MISSING_SENTINEL:
        print("Error: Cannot create English-only timestamped output with missing English SRT.", file=sys.stderr)
        sys.exit(1)
    
    if format_type == 'zh_only' and zh_srt_path == MISSING_SENTINEL:
        print("Error: Cannot create Chinese-only output with missing Chinese SRT.", file=sys.stderr)
        sys.exit(1)

    if format_type == 'zh_only_timestamp' and zh_srt_path == MISSING_SENTINEL:
        print("Error: Cannot create Chinese-only timestamped output with missing Chinese SRT.", file=sys.stderr)
        sys.exit(1)

    print(f"Starting SRT processing. Format: {format_type}")
    print(f"  EN SRT Path: {en_srt_path}")
    print(f"  ZH SRT Path: {zh_srt_path}")
    print(f"  Output Path: {output_file}")
    
    # Get base directory and file patterns for 'all' mode
    if format_type == 'all':
        output_dir = os.path.dirname(output_file)
        
        # 按照现有命名模式命名文件
        merged_output = os.path.join(output_dir, "merged_transcript_srt.md")
        parallel_output = os.path.join(output_dir, "parallel_transcript_srt.md")
        en_only_output = os.path.join(output_dir, "en_transcript_srt.md")
        zh_only_output = os.path.join(output_dir, "zh_transcript_srt.md")
        en_only_timestamp_output = os.path.join(output_dir, "en_transcript_srt_timestamp.md")
        zh_only_timestamp_output = os.path.join(output_dir, "zh_transcript_srt_timestamp.md")
    
    try:
        if format_type == "merged" or format_type == "all":
            if format_type == "all":
                create_merged_doc(en_srt_path, zh_srt_path, merged_output)
                print(f"Created merged bilingual transcript: {merged_output}")
            else:
                create_merged_doc(en_srt_path, zh_srt_path, output_file)
                print(f"Created merged bilingual transcript: {output_file}")
                
        if format_type == "parallel" or format_type == "all":
            if format_type == "all":
                create_parallel_doc(en_srt_path, zh_srt_path, parallel_output)
                print(f"Created parallel bilingual transcript: {parallel_output}")
            else:
                create_parallel_doc(en_srt_path, zh_srt_path, output_file)
                print(f"Created parallel bilingual transcript: {output_file}")
                
        if format_type == "en_only" or format_type == "all":
            if en_srt_path != MISSING_SENTINEL:
                if format_type == "all":
                    create_en_only_doc(en_srt_path, en_only_output)
                    print(f"Created English-only transcript: {en_only_output}")
                else:
                    create_en_only_doc(en_srt_path, output_file)
                    print(f"Created English-only transcript: {output_file}")
            elif format_type == "en_only":
                en_content_raw = parse_srt(en_srt_path) if en_srt_path != MISSING_SENTINEL else []
                en_content = deduplicate_overlaps(en_content_raw)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write('# English Transcript\n\n')
                    for item in en_content:
                        if item['en']:
                            f.write(item['en'].strip() + '\n\n')
                return
                
        if format_type == "en_only_timestamp" or format_type == "all":
            if en_srt_path != MISSING_SENTINEL:
                if format_type == "all":
                    create_en_only_doc_with_timestamp(en_srt_path, en_only_timestamp_output)
                    print(f"Created English-only transcript with timestamps: {en_only_timestamp_output}")
                else:
                    create_en_only_doc_with_timestamp(en_srt_path, output_file)
                    print(f"Created English-only transcript with timestamps: {output_file}")
            elif format_type == "en_only_timestamp": # Should be caught by validation
                print("Error: English SRT missing for en_only_timestamp format.", file=sys.stderr)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("# English Transcript (with Timestamps)\n\nError: No valid English content found (input SRT missing).\n")
                # sys.exit(1)
                
        if format_type == "zh_only" or format_type == "all":
            if zh_srt_path != MISSING_SENTINEL:
                if format_type == "all":
                    create_zh_only_doc(zh_srt_path, zh_only_output)
                    print(f"Created Chinese-only transcript: {zh_only_output}")
                else:
                    create_zh_only_doc(zh_srt_path, output_file)
                    print(f"Created Chinese-only transcript: {output_file}")
            elif format_type == "zh_only":
                zh_content_raw = parse_srt(zh_srt_path) if zh_srt_path != MISSING_SENTINEL else []
                zh_content = deduplicate_overlaps(zh_content_raw)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write('# 中文逐字稿\n\n')
                    for item in zh_content:
                        if item['zh']:
                            f.write(item['zh'].strip() + '\n\n')
                return

        if format_type == "zh_only_timestamp" or format_type == "all":
            if zh_srt_path != MISSING_SENTINEL:
                if format_type == "all":
                    create_zh_only_doc_with_timestamp(zh_srt_path, zh_only_timestamp_output)
                    print(f"Created Chinese-only transcript with timestamps: {zh_only_timestamp_output}")
                else:
                    create_zh_only_doc_with_timestamp(zh_srt_path, output_file)
                    print(f"Created Chinese-only transcript with timestamps: {output_file}")
            elif format_type == "zh_only_timestamp": # Should be caught by validation
                print("Error: Chinese SRT missing for zh_only_timestamp format.", file=sys.stderr)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("# 中文逐字稿 (带时间戳)\n\nError: 未找到有效的中文内容 (输入SRT缺失)。\n")
                # sys.exit(1)
        
        # Exit successfully if functions complete without error
        sys.exit(0)
        
    except Exception as e:
        # Catch any unexpected errors during processing
        print(f"An unexpected error occurred during merge process: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 
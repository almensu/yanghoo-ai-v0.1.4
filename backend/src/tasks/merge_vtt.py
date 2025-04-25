import re
import sys
from datetime import timedelta
import os # Import os for path checks

# Sentinel value for missing input files
MISSING_SENTINEL = "MISSING"

def parse_vtt(vtt_file):
    """Parse VTT file and extract timestamps and text."""
    # Check if the file exists before trying to open
    if not os.path.exists(vtt_file):
        print(f"Warning: VTT file not found at {vtt_file}, skipping.", file=sys.stderr)
        return []
    
    try:
        with open(vtt_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading VTT file {vtt_file}: {e}", file=sys.stderr)
        return []
    
    # Remove VTT header and styling
    content = re.sub(r'WEBVTT.*?\n\n', '', content, flags=re.DOTALL)
    content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    
    # Extract timestamps and text
    pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> .*?\n(.*?)(?=\n\d{2}:\d{2}:\d{2}\.\d{3}|$)'
    matches = re.findall(pattern, content, re.DOTALL)
    
    parsed = []
    for timestamp, text in matches:
        # Clean up text
        text = re.sub(r'\n+', ' ', text.strip())
        # Convert timestamp to simplified format
        time_obj = timestamp.split('.')
        simplified_time = time_obj[0]
        parsed.append((simplified_time, text))
    
    return parsed

def create_merged_doc(en_vtt_path, zh_vtt_path, output_file):
    """Create a merged markdown document with both languages."""
    en_content = parse_vtt(en_vtt_path) if en_vtt_path != MISSING_SENTINEL else []
    zh_content = parse_vtt(zh_vtt_path) if zh_vtt_path != MISSING_SENTINEL else []
    
    if not en_content and not zh_content:
        print("Error: No valid VTT content found to merge.", file=sys.stderr)
        # Create an empty file or error out?
        with open(output_file, 'w', encoding='utf-8') as f:
             f.write("# Bilingual Transcript / 双语字幕\n\nError: No valid input VTT files found or content parsed.\n")
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

def create_parallel_doc(en_vtt_path, zh_vtt_path, output_file):
    """Create a parallel document with timestamps and both languages in table format."""
    en_content = parse_vtt(en_vtt_path) if en_vtt_path != MISSING_SENTINEL else []
    zh_content = parse_vtt(zh_vtt_path) if zh_vtt_path != MISSING_SENTINEL else []

    if not en_content and not zh_content:
        print("Error: No valid VTT content found to merge.", file=sys.stderr)
        with open(output_file, 'w', encoding='utf-8') as f:
             f.write("# Bilingual Transcript / 双语字幕\n\nError: No valid input VTT files found or content parsed.\n")
        return # Or sys.exit(1)

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

def main():
    # Expect 5 arguments: script_name, en_vtt, zh_vtt, format, output_file
    if len(sys.argv) != 5:
        print(f"Usage: python {os.path.basename(__file__)} <en_vtt_path|{MISSING_SENTINEL}> <zh_vtt_path|{MISSING_SENTINEL}> <format> <output_abs_path>")
        print("Format options: merged, parallel")
        sys.exit(1)
    
    en_vtt_path = sys.argv[1]
    zh_vtt_path = sys.argv[2]
    format_type = sys.argv[3]
    output_file = sys.argv[4] # This is now the absolute output path
    
    # Basic validation
    if en_vtt_path == MISSING_SENTINEL and zh_vtt_path == MISSING_SENTINEL:
        print(f"Error: At least one input VTT path must be provided (not {MISSING_SENTINEL}).", file=sys.stderr)
        sys.exit(1)
        
    if format_type not in ['merged', 'parallel']:
         print(f"Error: Invalid format '{format_type}'. Choose from: merged, parallel", file=sys.stderr)
         sys.exit(1)

    print(f"Starting VTT merge. Format: {format_type}")
    print(f"  EN VTT Path: {en_vtt_path}")
    print(f"  ZH VTT Path: {zh_vtt_path}")
    print(f"  Output Path: {output_file}")
    
    try:
        if format_type == "merged":
            create_merged_doc(en_vtt_path, zh_vtt_path, output_file)
            print(f"Created merged bilingual transcript: {output_file}")
        elif format_type == "parallel":
            create_parallel_doc(en_vtt_path, zh_vtt_path, output_file)
            print(f"Created parallel bilingual transcript: {output_file}")
        
        # Exit successfully if functions complete without error
        sys.exit(0)
        
    except Exception as e:
        # Catch any unexpected errors during processing
        print(f"An unexpected error occurred during merge process: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 
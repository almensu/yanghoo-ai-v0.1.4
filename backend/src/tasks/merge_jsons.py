import glob
from pathlib import Path
import json
import sys
import argparse

def merge_transcription_chunks(chunks_json_directory_str: str, output_merged_json_path_str: str, nominal_chunk_duration_seconds: int = 600):
    """
    Merges multiple WhisperX output JSON files and corrects timestamps.

    Args:
        chunks_json_directory_str (str): Directory containing JSON files for each audio chunk.
        output_merged_json_path_str (str): Path to save the final merged JSON file.
        nominal_chunk_duration_seconds (int): Nominal duration of each audio chunk in seconds.
    """
    chunks_json_directory = Path(chunks_json_directory_str)
    output_merged_json_path = Path(output_merged_json_path_str)
    
    merged_segments = []
    full_text_parts = []
    total_word_count = 0
    first_model_info = None

    # Ensure glob pattern matches your chunk JSON naming, e.g., 'chunk_*_transcription.json'
    # This pattern assumes filenames like chunk_000_transcription.json, chunk_001_transcription.json etc.
    chunk_json_files = sorted(glob.glob(str(chunks_json_directory / 'chunk_*_transcription.json')))

    if not chunk_json_files:
        print(f"No JSON files found in {chunks_json_directory} matching pattern 'chunk_*_transcription.json'.", file=sys.stderr)
        # Consider raising an exception or returning a more indicative failure value for programmatic use
        return False 

    for i, chunk_json_file_path_str in enumerate(chunk_json_files):
        chunk_json_file_path = Path(chunk_json_file_path_str)
        # This is the crucial offset for all timestamps within the current chunk
        current_chunk_original_start_time = i * nominal_chunk_duration_seconds

        try:
            with open(chunk_json_file_path, 'r', encoding='utf-8') as f:
                chunk_data = json.load(f)
        except FileNotFoundError:
            print(f"Error: Chunk JSON file not found: {chunk_json_file_path}", file=sys.stderr)
            continue # Skip this file and try the next
        except json.JSONDecodeError as e:
            print(f"Error: Failed to parse JSON from {chunk_json_file_path}: {e}", file=sys.stderr)
            continue # Skip this file
        except Exception as e:
            print(f"An unexpected error occurred while reading {chunk_json_file_path}: {e}", file=sys.stderr)
            continue

        if i == 0: # Store model info from the first successfully processed chunk
            first_model_info = chunk_data.get("model_info")

        # Process segments and adjust timestamps
        for segment in chunk_data.get("segments", []):
            adjusted_segment = segment.copy() # Create a copy to modify

            # Adjust segment's own start and end times
            if "start" in adjusted_segment and isinstance(adjusted_segment["start"], (int, float)):
                adjusted_segment["start"] = round(adjusted_segment["start"] + current_chunk_original_start_time, 3)
            if "end" in adjusted_segment and isinstance(adjusted_segment["end"], (int, float)):
                adjusted_segment["end"] = round(adjusted_segment["end"] + current_chunk_original_start_time, 3)

            # Adjust timestamps within the 'words' list of the segment
            adjusted_words = []
            if "words" in adjusted_segment and isinstance(adjusted_segment["words"], list):
                for word_info in adjusted_segment["words"]:
                    adjusted_word_info = word_info.copy()
                    if "start" in adjusted_word_info and isinstance(adjusted_word_info["start"], (int, float)):
                        adjusted_word_info["start"] = round(adjusted_word_info["start"] + current_chunk_original_start_time, 3)
                    if "end" in adjusted_word_info and isinstance(adjusted_word_info["end"], (int, float)):
                        adjusted_word_info["end"] = round(adjusted_word_info["end"] + current_chunk_original_start_time, 3)
                    # word_info might also contain 'score', ensure it's handled if needed or just copied.
                    adjusted_words.append(adjusted_word_info)
            adjusted_segment["words"] = adjusted_words
            merged_segments.append(adjusted_segment)

        full_text_parts.append(chunk_data.get("text", "").strip())
        total_word_count += chunk_data.get("word_count", 0)

    # Construct the final merged data structure
    merged_data = {
        "model_info": first_model_info if first_model_info else {},
        "text": " ".join(full_text_parts), # Concatenate text from all chunks
        "segments": merged_segments,      # Use the list of segments with adjusted timestamps
        "word_count": total_word_count,
        "segment_count": len(merged_segments)
    }

    # Write the merged data to the output JSON file
    try:
        output_merged_json_path.parent.mkdir(parents=True, exist_ok=True) # Ensure output directory exists
        with open(output_merged_json_path, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully merged transcriptions to: {output_merged_json_path}")
        return True
    except Exception as e:
        print(f"Error writing merged JSON file {output_merged_json_path}: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    # This is an example of how to use the function directly.
    # Replace with actual paths when integrating into your orchestrator.
    parser = argparse.ArgumentParser(description="Merge WhisperX JSON transcription chunks.")
    parser.add_argument("--chunks_dir", required=True, help="Directory containing the chunked JSON files (e.g., chunk_000_transcription.json).")
    parser.add_argument("--output_file", required=True, help="Path to save the final merged JSON file.")
    parser.add_argument("--segment_duration", type=int, default=600, help="Nominal duration of each audio chunk in seconds (default: 600).")

    args = parser.parse_args()

    success = merge_transcription_chunks(
        args.chunks_dir,
        args.output_file,
        args.segment_duration
    )

    if success:
        print("Merging process completed successfully.")
    else:
        print("Merging process failed.")
        sys.exit(1) 
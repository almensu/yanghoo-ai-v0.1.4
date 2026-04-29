import argparse
import json
import os
import time
import sys

def main():
    parser = argparse.ArgumentParser(description="Yanghoo MLX Audio Transcription Wrapper")
    parser.add_argument("--audio", required=True, help="Path to the audio file")
    parser.add_argument("--model", required=True, help="MLX model name")
    parser.add_argument("--output-json", required=True, help="Path to save the JSON output")

    args = parser.parse_args()

    try:
        from mlx_audio.stt.generate import generate_transcription
    except ImportError as e:
        print(f"Error: Failed to import mlx_audio. Ensure it is installed in the current Python environment.\n{e}", file=sys.stderr)
        sys.exit(1)

    print(f"Starting transcription: {args.audio} using {args.model}")
    start_time = time.time()

    try:
        # call MLX Audio
        # generate_transcription typically returns a dict or a list of segments
        result = generate_transcription(
            model=args.model,
            audio=args.audio
        )

        # Normalize segments
        segments = []
        full_text = ""
        
        if hasattr(result, "segments"):
            segments = result.segments
            if hasattr(result, "text"):
                full_text = result.text
        elif isinstance(result, list):
            segments = result
        elif isinstance(result, dict) and "segments" in result:
            segments = result["segments"]
            full_text = result.get("text", "")
        else:
            # If it's a string, maybe it's just the full text? 
            # But we need segments.
            print(f"Warning: Unexpected result type from generate_transcription: {type(result)}", file=sys.stderr)
            if isinstance(result, str):
                full_text = result
                # Mock a single segment if we only got text
                segments = [{"start": 0.0, "end": 0.0, "text": result}]
            elif hasattr(result, "text"):
                full_text = result.text

        normalized_segments = []
        for s in segments:
            # Handle potential string-representation of dicts
            if isinstance(s, str) and s.strip().startswith("{"):
                try:
                    import ast
                    s = ast.literal_eval(s)
                except:
                    pass
            
            # Handle object with attributes (common for STTOutput)
            if not isinstance(s, dict) and hasattr(s, "start") and hasattr(s, "end") and hasattr(s, "text"):
                normalized_segments.append({
                    "start": float(s.start),
                    "end": float(s.end),
                    "text": str(s.text).strip()
                })
            elif isinstance(s, dict):
                normalized_segments.append({
                    "start": float(s.get("start", 0.0)),
                    "end": float(s.get("end", 0.0)),
                    "text": s.get("text", "").strip()
                })
            else:
                # If s is just a string, it might be the text of the segment
                normalized_segments.append({
                    "start": 0.0,
                    "end": 0.0,
                    "text": str(s).strip()
                })

        if not full_text and normalized_segments:
            full_text = " ".join([s["text"] for s in normalized_segments])

        finished_at = time.time()
        elapsed_sec = finished_at - start_time

        output_data = {
            "text": full_text,
            "segments": normalized_segments,
            "metadata": {
                "model": args.model,
                "audioFile": os.path.basename(args.audio),
                "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(start_time)),
                "finishedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(finished_at)),
                "elapsedSec": round(elapsed_sec, 2),
                "segmentsCount": len(normalized_segments)
            }
        }

        # Create parent output directory if needed
        output_dir = os.path.dirname(args.output_json)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"Transcription finished in {elapsed_sec:.2f}s. Output saved to {args.output_json}")

    except Exception as e:
        print(f"Transcription failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

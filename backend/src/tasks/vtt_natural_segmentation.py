import re
import json
import asyncio
import aiofiles
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass
from pathlib import Path
import logging

# NLP imports
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

try:
    import stanza
    STANZA_AVAILABLE = True
except ImportError:
    STANZA_AVAILABLE = False

logger = logging.getLogger(__name__)

@dataclass
class VTTCue:
    start_time: float
    end_time: float
    text: str
    original_index: int = -1

class VTTProcessor:
    def __init__(self, merge_threshold: float = 0.8, min_segment_duration: float = 0.5):
        self.merge_threshold = merge_threshold
        self.min_segment_duration = min_segment_duration
        self.nlp = self._init_nlp()
    
    def _init_nlp(self):
        """Initialize NLP model for segmentation"""
        if SPACY_AVAILABLE:
            try:
                # Try Chinese first, fallback to English
                nlp = spacy.load("zh_core_web_sm")
                logger.info("Loaded spaCy Chinese model for segmentation")
                return nlp
            except OSError:
                try:
                    nlp = spacy.load("en_core_web_sm") 
                    logger.info("Loaded spaCy English model for segmentation")
                    return nlp
                except OSError:
                    logger.warning("No spaCy models available, using rule-based segmentation")
                    return None
        elif STANZA_AVAILABLE:
            try:
                nlp = stanza.Pipeline('zh', processors='tokenize')
                logger.info("Loaded Stanza Chinese model for segmentation")
                return nlp
            except Exception:
                try:
                    nlp = stanza.Pipeline('en', processors='tokenize')
                    logger.info("Loaded Stanza English model for segmentation")
                    return nlp
                except Exception:
                    logger.warning("No Stanza models available, using rule-based segmentation")
                    return None
        else:
            logger.warning("No NLP libraries available, using rule-based segmentation")
            return None
    
    def _parse_vtt_time(self, time_str: str) -> float:
        """Convert VTT timestamp to seconds"""
        match = re.match(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3})', time_str)
        if not match:
            return 0.0
        hours, minutes, seconds, ms = map(int, match.groups())
        return hours * 3600 + minutes * 60 + seconds + ms / 1000
    
    def _format_vtt_time(self, seconds: float) -> str:
        """Convert seconds to VTT timestamp"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"
    
    def parse_vtt(self, vtt_content: str) -> List[VTTCue]:
        """Parse VTT content into cues"""
        if not vtt_content or not vtt_content.strip():
            return []
        
        # Remove WEBVTT header and styling
        content = re.sub(r'WEBVTT.*?\n\n', '', vtt_content, flags=re.DOTALL)
        content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
        
        cues = []
        # Pattern to match VTT entries - more flexible
        pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\n|\n\d{2}:\d{2}:\d{2}\.\d{3}|\Z)'
        matches = re.findall(pattern, content, re.DOTALL)
        
        for i, (start_str, end_str, text) in enumerate(matches):
            # Clean text - remove extra whitespace and newlines
            clean_text = re.sub(r'\n+', ' ', text.strip())
            clean_text = re.sub(r'\s+', ' ', clean_text)
            
            if clean_text:  # Only add non-empty cues
                start_time = self._parse_vtt_time(start_str)
                end_time = self._parse_vtt_time(end_str)
                
                # Skip invalid time ranges
                if end_time > start_time:
                    cues.append(VTTCue(
                        start_time=start_time,
                        end_time=end_time,
                        text=clean_text,
                        original_index=i
                    ))
        
        logger.info(f"Parsed {len(cues)} valid cues from VTT content")
        return cues
    
    def merge_close_cues(self, cues: List[VTTCue]) -> List[VTTCue]:
        """Step 1: Merge temporally close cues"""
        if not cues:
            return []
        
        merged = []
        current_merge = None
        
        for cue in cues:
            if current_merge is None:
                current_merge = VTTCue(
                    start_time=cue.start_time,
                    end_time=cue.end_time,
                    text=cue.text,
                    original_index=cue.original_index
                )
            else:
                time_gap = cue.start_time - current_merge.end_time
                
                if time_gap <= self.merge_threshold:
                    # Merge with current
                    current_merge.end_time = cue.end_time
                    # Add a space between merged texts
                    current_merge.text += " " + cue.text
                else:
                    # Save current merge and start new one
                    merged.append(current_merge)
                    current_merge = VTTCue(
                        start_time=cue.start_time,
                        end_time=cue.end_time,
                        text=cue.text,
                        original_index=cue.original_index
                    )
        
        # Don't forget the last merge
        if current_merge:
            merged.append(current_merge)
        
        logger.info(f"Merged {len(cues)} cues into {len(merged)} segments")
        return merged
    
    def segment_text(self, text: str) -> List[str]:
        """Step 2: Re-segment text naturally using NLP"""
        if not text.strip():
            return []
        
        if self.nlp:
            if SPACY_AVAILABLE and hasattr(self.nlp, 'pipe'):
                # spaCy
                doc = self.nlp(text)
                sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
            elif STANZA_AVAILABLE:
                # Stanza
                doc = self.nlp(text)
                sentences = []
                for sentence in doc.sentences:
                    sent_text = sentence.text.strip()
                    if sent_text:
                        sentences.append(sent_text)
            else:
                sentences = self._rule_based_segment(text)
        else:
            # Fallback to rule-based
            sentences = self._rule_based_segment(text)
        
        return sentences if sentences else [text]
    
    def _rule_based_segment(self, text: str) -> List[str]:
        """Fallback rule-based segmentation"""
        # Split on sentence endings but be conservative
        # Chinese and English sentence endings
        patterns = [
            r'[。！？.!?]+\s*',  # Sentence endings
            r'[；;]\s*',         # Semicolons  
        ]
        
        sentences = [text]
        
        for pattern in patterns:
            new_sentences = []
            for sent in sentences:
                parts = re.split(f'({pattern})', sent)  # Keep delimiter
                current = ""
                for part in parts:
                    if re.match(pattern, part):
                        current += part
                        if current.strip():
                            new_sentences.append(current.strip())
                        current = ""
                    else:
                        current += part
                if current.strip():
                    new_sentences.append(current.strip())
            sentences = new_sentences if new_sentences else sentences
        
        return sentences if sentences else [text]
    
    def redistribute_timing(self, merged_cue: VTTCue, sentences: List[str]) -> List[VTTCue]:
        """Step 3: Redistribute timing proportionally based on character count"""
        if not sentences:
            return []
        
        if len(sentences) == 1:
            return [VTTCue(
                start_time=merged_cue.start_time,
                end_time=merged_cue.end_time,
                text=sentences[0],
                original_index=merged_cue.original_index
            )]
        
        total_chars = sum(len(sent) for sent in sentences)
        if total_chars == 0:
            return []
        
        total_duration = merged_cue.end_time - merged_cue.start_time
        new_cues = []
        current_start = merged_cue.start_time
        
        for i, sentence in enumerate(sentences):
            # Calculate proportional duration
            char_ratio = len(sentence) / total_chars
            duration = total_duration * char_ratio
            
            # Ensure minimum duration
            if duration < self.min_segment_duration and len(sentences) > 1:
                duration = self.min_segment_duration
            
            end_time = current_start + duration
            
            # For the last sentence, ensure we end exactly at the original end time
            if i == len(sentences) - 1:
                end_time = merged_cue.end_time
            
            new_cues.append(VTTCue(
                start_time=current_start,
                end_time=end_time,
                text=sentence.strip(),
                original_index=merged_cue.original_index
            ))
            
            current_start = end_time
        
        return new_cues
    
    def process_vtt_content(self, vtt_content: str) -> str:
        """Main processing pipeline: merge → segment → redistribute → generate"""
        # Step 1: Parse VTT content
        original_cues = self.parse_vtt(vtt_content)
        if not original_cues:
            logger.warning("No cues found in VTT content, returning original")
            return vtt_content  # Return original if nothing to process
        
        # Step 2: Merge close cues
        merged_cues = self.merge_close_cues(original_cues)
        
        # Step 3 & 4: Re-segment and redistribute timing
        final_cues = []
        for merged_cue in merged_cues:
            sentences = self.segment_text(merged_cue.text)
            redistributed_cues = self.redistribute_timing(merged_cue, sentences)
            final_cues.extend(redistributed_cues)
        
        logger.info(f"Final processing: {len(original_cues)} → {len(merged_cues)} → {len(final_cues)} cues")
        
        # Step 5: Generate new VTT content
        return self._generate_vtt_content(final_cues)
    
    def _generate_vtt_content(self, cues: List[VTTCue]) -> str:
        """Generate VTT file content from processed cues"""
        if not cues:
            return "WEBVTT\n\n"
        
        vtt_lines = ["WEBVTT", ""]
        
        for i, cue in enumerate(cues, 1):
            vtt_lines.append(str(i))
            start_str = self._format_vtt_time(cue.start_time)
            end_str = self._format_vtt_time(cue.end_time)
            vtt_lines.append(f"{start_str} --> {end_str}")
            vtt_lines.append(cue.text)
            vtt_lines.append("")  # Empty line between cues
        
        return "\n".join(vtt_lines)

# Main task function for integration with your system
async def process_vtt_natural_segmentation(
    task_uuid: str, 
    metadata_file: str = "backend/data/metadata.json",
    merge_threshold: float = 0.8
) -> Dict[str, any]:
    """
    Process VTT files for natural segmentation
    Creates *_segmented.vtt files alongside originals
    
    Args:
        task_uuid: UUID of the task
        metadata_file: Path to metadata file
        merge_threshold: Time gap threshold for merging cues (seconds)
    
    Returns:
        Dictionary with processing results
    """
    base_dir = Path(metadata_file).parent
    video_dir = base_dir / task_uuid
    
    if not video_dir.exists():
        raise ValueError(f"Task directory not found: {video_dir}")
    
    processor = VTTProcessor(merge_threshold=merge_threshold)
    results = {
        "processed_files": {},
        "errors": [],
        "stats": {
            "original_cues": {},
            "final_cues": {}
        }
    }
    
    # Process both English and Chinese VTT files
    vtt_files = {
        "en": video_dir / "transcript_en.vtt",
        "zh-Hans": video_dir / "transcript_zh-Hans.vtt"
    }
    
    for lang, vtt_path in vtt_files.items():
        if not vtt_path.exists():
            logger.info(f"VTT file not found: {vtt_path}")
            continue
        
        try:
            logger.info(f"Processing {lang} VTT: {vtt_path}")
            
            # Read original VTT
            async with aiofiles.open(vtt_path, 'r', encoding='utf-8') as f:
                original_content = await f.read()
            
            # Check if file is empty or only contains header
            if not original_content.strip() or original_content.strip() == "WEBVTT":
                logger.info(f"Empty VTT file: {vtt_path}")
                results["errors"].append(f"Empty VTT file: {lang}")
                continue
            
            # Count original cues for stats
            original_cues = processor.parse_vtt(original_content)
            results["stats"]["original_cues"][lang] = len(original_cues)
            
            # Process content
            processed_content = processor.process_vtt_content(original_content)
            
            # Count final cues for stats
            final_cues = processor.parse_vtt(processed_content)
            results["stats"]["final_cues"][lang] = len(final_cues)
            
            # Save segmented version
            segmented_path = video_dir / f"transcript_{lang}_segmented.vtt"
            async with aiofiles.open(segmented_path, 'w', encoding='utf-8') as f:
                await f.write(processed_content)
            
            results["processed_files"][lang] = {
                "original": str(vtt_path.relative_to(base_dir)),
                "segmented": str(segmented_path.relative_to(base_dir))
            }
            
            logger.info(f"Successfully processed {lang} VTT: {len(original_cues)} → {len(final_cues)} cues")
            
        except Exception as e:
            error_msg = f"Error processing {lang} VTT: {str(e)}"
            logger.error(error_msg, exc_info=True)
            results["errors"].append(error_msg)
    
    # Update metadata to include segmented files
    if results["processed_files"]:
        await _update_metadata_with_segmented_files(task_uuid, results["processed_files"], metadata_file)
    
    return results

async def _update_metadata_with_segmented_files(
    task_uuid: str, 
    processed_files: Dict[str, Dict[str, str]], 
    metadata_file: str
):
    """Update metadata.json to include segmented VTT file paths"""
    try:
        async with aiofiles.open(metadata_file, 'r', encoding='utf-8') as f:
            content = await f.read()
            metadata = json.loads(content)
        
        if task_uuid in metadata:
            if "vtt_files_segmented" not in metadata[task_uuid]:
                metadata[task_uuid]["vtt_files_segmented"] = {}
            
            for lang, files in processed_files.items():
                metadata[task_uuid]["vtt_files_segmented"][lang] = files["segmented"]
            
            async with aiofiles.open(metadata_file, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(metadata, indent=4, ensure_ascii=False, default=str))
            
            logger.info(f"Updated metadata for {task_uuid} with segmented VTT files")
        
    except Exception as e:
        logger.error(f"Failed to update metadata: {e}")

# CLI usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="VTT Natural Segmentation Tool")
    parser.add_argument("task_uuid", help="Task UUID to process")
    parser.add_argument("--threshold", type=float, default=0.8, 
                       help="Time merge threshold in seconds (default: 0.8)")
    parser.add_argument("--metadata", default="backend/data/metadata.json",
                       help="Path to metadata file")
    
    args = parser.parse_args()
    
    async def main():
        try:
            result = await process_vtt_natural_segmentation(
                args.task_uuid, 
                args.metadata, 
                args.threshold
            )
            print(f"Processing complete: {result}")
        except Exception as e:
            print(f"Error: {e}")
    
    asyncio.run(main()) 
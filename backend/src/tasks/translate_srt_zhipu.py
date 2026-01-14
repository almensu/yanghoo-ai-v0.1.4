"""
LLM Subtitle Translation Module - Zhipu AI Version

Translates SRT subtitle files from one language to another using Zhipu AI (GLM) API.
Supports batch processing to handle long subtitles.

Uses OpenAI-compatible API with Zhipu AI endpoint.

Author: YangHoo AI
Date: 2026-01-14
"""

import re
import os
import json
import logging
from pathlib import Path
from typing import List, Dict
from openai import OpenAI

logger = logging.getLogger(__name__)

# SRT parsing patterns
SRT_NUMBER_PATTERN = re.compile(r'^(\d+)$')
SRT_TIMESTAMP_PATTERN = re.compile(r'^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})')


def parse_srt_file(srt_path: str) -> List[Dict]:
    """
    Parse SRT file into structured data.

    Args:
        srt_path: Path to SRT file

    Returns:
        List of subtitle dictionaries with keys:
        - number: int
        - start_time: str (HH:MM:SS,mmm)
        - end_time: str (HH:MM:SS,mmm)
        - text: str

    Raises:
        FileNotFoundError: If SRT file doesn't exist
        ValueError: If SRT file is invalid
    """
    if not os.path.exists(srt_path):
        raise FileNotFoundError(f"SRT file not found: {srt_path}")

    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into subtitle blocks
    blocks = re.split(r'\n\s*\n', content.strip())
    subtitles = []

    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue

        try:
            # Parse subtitle number
            number = int(lines[0].strip())

            # Parse timestamp
            timestamp_match = SRT_TIMESTAMP_PATTERN.match(lines[1].strip())
            if not timestamp_match:
                continue

            start_time = timestamp_match.group(1)
            end_time = timestamp_match.group(2)

            # Parse text (remaining lines)
            text = '\n'.join(lines[2:]).strip()

            subtitles.append({
                'number': number,
                'start_time': start_time,
                'end_time': end_time,
                'text': text
            })
        except (ValueError, IndexError):
            continue

    logger.info(f"Parsed {len(subtitles)} subtitles from {srt_path}")
    return subtitles


def deduplicate_subtitles(subtitles: List[Dict]) -> List[Dict]:
    """
    Remove cumulative duplicates from subtitles.

    Args:
        subtitles: List of subtitle dictionaries

    Returns:
        Deduplicated list of subtitles
    """
    if not subtitles:
        return []

    deduplicated = [subtitles[0]]

    for i in range(1, len(subtitles)):
        prev_text = deduplicated[-1]['text']
        current_text = subtitles[i]['text']

        # Check if current text starts with previous text
        if prev_text and current_text != prev_text and current_text.startswith(prev_text):
            # Remove the overlapping part
            new_text = current_text[len(prev_text):].strip()
            if new_text:
                # Create new subtitle with deduplicated text
                new_sub = subtitles[i].copy()
                new_sub['text'] = new_text
                deduplicated.append(new_sub)
        elif current_text != prev_text:
            deduplicated.append(subtitles[i])

    return deduplicated


def chunk_subtitles(subtitles: List[Dict], chunk_size: int = 50) -> List[List[Dict]]:
    """
    Split subtitles into chunks for batch translation.

    Args:
        subtitles: List of subtitle dictionaries
        chunk_size: Number of subtitles per chunk

    Returns:
        List of subtitle chunks
    """
    chunks = []
    for i in range(0, len(subtitles), chunk_size):
        chunks.append(subtitles[i:i + chunk_size])
    return chunks


def create_translation_prompt(subtitle_chunk: List[Dict], source_lang: str = "English", target_lang: str = "Chinese") -> str:
    """
    Create a translation prompt for a chunk of subtitles.

    Args:
        subtitle_chunk: List of subtitle dictionaries
        source_lang: Source language name
        target_lang: Target language name

    Returns:
        Translation prompt string
    """
    # Format subtitles for the prompt
    formatted_subs = []
    for sub in subtitle_chunk:
        formatted_subs.append(f"{sub['number']}. {sub['text']}")

    subtitles_text = '\n'.join(formatted_subs)

    prompt = f"""You are a professional subtitle translator. Translate the following {source_lang} subtitles to {target_lang}.

## Requirements:
1. **Natural Translation**: Translate naturally, not word-for-word. Consider the full context.
2. **Preserve Format**: Only translate the text content, keep the line numbers as they are.
3. **No Line Numbers in Output**: Do NOT include line numbers in your translation.
4. **One Per Line**: Each subtitle text on a separate line.
5. **Cultural Adaptation**: Adapt idioms and cultural references appropriately.
6. **Consistency**: Maintain consistent terminology throughout.

## Subtitles to Translate:
{subtitles_text}

## Output Format:
Return ONLY the translated text, one subtitle per line, without line numbers:
Translated text 1
Translated text 2
Translated text 3
...

Remember: Do NOT include line numbers in your response. Only return the translated text lines.
"""

    return prompt


def parse_translation_response(response_text: str, original_chunk: List[Dict]) -> List[Dict]:
    """
    Parse LLM translation response and map to original subtitles.

    Args:
        response_text: LLM response text
        original_chunk: Original subtitle chunk for mapping

    Returns:
        List of translated subtitle dictionaries
    """
    # Split response into lines and filter empty lines
    translated_lines = [line.strip() for line in response_text.strip().split('\n') if line.strip()]

    # Map translations to original subtitles
    translated_subs = []
    for i, sub in enumerate(original_chunk):
        if i < len(translated_lines):
            translated_subs.append({
                'number': sub['number'],
                'start_time': sub['start_time'],
                'end_time': sub['end_time'],
                'text': translated_lines[i]
            })
        else:
            # If fewer translations than originals, keep original
            translated_subs.append(sub)

    return translated_subs


def generate_srt_content(subtitles: List[Dict]) -> str:
    """
    Generate SRT file content from subtitle list.

    Args:
        subtitles: List of subtitle dictionaries

    Returns:
        SRT formatted string
    """
    srt_lines = []

    for sub in subtitles:
        srt_lines.append(str(sub['number']))
        srt_lines.append(f"{sub['start_time']} --> {sub['end_time']}")
        srt_lines.append(sub['text'])
        srt_lines.append("")  # Empty line between subtitles

    return '\n'.join(srt_lines)


async def translate_subtitles_with_zhipu(
    subtitles: List[Dict],
    model: str = "glm-4.7",
    source_lang: str = "English",
    target_lang: str = "Chinese",
    chunk_size: int = 50,
    api_key: str = None,
    base_url: str = "https://open.bigmodel.cn/api/coding/paas/v4/"
) -> List[Dict]:
    """
    Translate subtitles using Zhipu AI (GLM) API.

    Args:
        subtitles: List of subtitle dictionaries
        model: Zhipu AI model to use (default: glm-4.7)
        source_lang: Source language name
        target_lang: Target language name
        chunk_size: Number of subtitles per batch
        api_key: Zhipu AI API key (optional, will use env var if not provided)
        base_url: Zhipu AI Coding API base URL (default: https://open.bigmodel.cn/api/coding/paas/v4/)

    Returns:
        List of translated subtitle dictionaries

    Raises:
        ValueError: If translation fails
    """
    # Set API key if provided
    if api_key:
        os.environ["ZHIPU_API_KEY"] = api_key

    # Verify API key is available
    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        raise ValueError("ZHIPU_API_KEY environment variable not set")

    logger.info(f"Translating {len(subtitles)} subtitles with {model}")

    # Split into chunks
    chunks = chunk_subtitles(subtitles, chunk_size)
    logger.info(f"Split into {len(chunks)} chunks for translation")

    # Initialize Zhipu AI client (using OpenAI SDK)
    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )
    translated_subs = []

    for chunk_idx, chunk in enumerate(chunks):
        logger.info(f"Translating chunk {chunk_idx + 1}/{len(chunks)} ({len(chunk)} subtitles)")

        # Create prompt
        prompt = create_translation_prompt(chunk, source_lang, target_lang)

        try:
            # Call Zhipu AI API
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional subtitle translator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            response_text = response.choices[0].message.content

            if not response_text:
                logger.warning(f"Empty response for chunk {chunk_idx + 1}, using original subtitles")
                translated_subs.extend(chunk)
                continue

            # Parse response
            parsed_subs = parse_translation_response(response_text, chunk)

            # Verify we got the right number of translations
            if len(parsed_subs) != len(chunk):
                logger.warning(f"Expected {len(chunk)} translations, got {len(parsed_subs)}")

            translated_subs.extend(parsed_subs)

            logger.info(f"Chunk {chunk_idx + 1} translation complete")

        except Exception as e:
            logger.error(f"Failed to translate chunk {chunk_idx + 1}: {e}")
            # On failure, keep original subtitles for this chunk
            translated_subs.extend(chunk)

    logger.info(f"Translation complete: {len(translated_subs)} subtitles")
    return translated_subs


async def translate_srt_file(
    srt_input_path: str,
    srt_output_path: str,
    txt_output_path: str = None,
    model: str = "glm-4.7",
    source_lang: str = "English",
    target_lang: str = "Chinese",
    chunk_size: int = 50,
    deduplicate: bool = True,
    api_key: str = None,
    base_url: str = "https://open.bigmodel.cn/api/coding/paas/v4/"
) -> Dict:
    """
    Translate an SRT file to another language.

    Args:
        srt_input_path: Path to input SRT file
        srt_output_path: Path to output translated SRT file
        txt_output_path: Path to output clean text file (optional)
        model: Zhipu AI model to use
        source_lang: Source language name
        target_lang: Target language name
        chunk_size: Number of subtitles per batch
        deduplicate: Whether to deduplicate before translation
        api_key: Zhipu AI API key (optional)
        base_url: Zhipu AI API base URL

    Returns:
        Dictionary with translation results

    Raises:
        FileNotFoundError: If input file doesn't exist
        ValueError: If translation fails
    """
    logger.info(f"Starting SRT translation: {srt_input_path} -> {srt_output_path}")
    logger.info(f"Model: {model}, {source_lang} -> {target_lang}")

    # Parse SRT file
    subtitles = parse_srt_file(srt_input_path)

    original_count = len(subtitles)
    logger.info(f"Parsed {original_count} subtitles from input file")

    # Deduplicate if requested
    if deduplicate:
        subtitles = deduplicate_subtitles(subtitles)
        logger.info(f"After deduplication: {len(subtitles)} unique subtitles")

    # Translate
    translated_subs = await translate_subtitles_with_zhipu(
        subtitles,
        model=model,
        source_lang=source_lang,
        target_lang=target_lang,
        chunk_size=chunk_size,
        api_key=api_key,
        base_url=base_url
    )

    # Deduplicate translated subtitles (in case LLM created duplicates)
    if deduplicate:
        translated_subs = deduplicate_subtitles(translated_subs)
        logger.info(f"After translation deduplication: {len(translated_subs)} subtitles")

    # Generate output SRT content
    srt_content = generate_srt_content(translated_subs)

    # Ensure output directory exists
    output_dir = os.path.dirname(srt_output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    # Write SRT file
    with open(srt_output_path, 'w', encoding='utf-8') as f:
        f.write(srt_content)

    logger.info(f"Translated SRT written to {srt_output_path}")

    # Generate clean text file if requested
    if txt_output_path:
        clean_text_lines = [sub['text'] for sub in translated_subs]
        clean_text = '\n\n'.join(clean_text_lines)

        with open(txt_output_path, 'w', encoding='utf-8') as f:
            f.write(clean_text)

        logger.info(f"Clean text written to {txt_output_path}")

    return {
        'success': True,
        'original_count': original_count,
        'translated_count': len(translated_subs),
        'srt_file': srt_output_path,
        'txt_file': txt_output_path,
        'model_used': model
    }


def main():
    """Command-line interface for SRT translation."""
    import argparse

    parser = argparse.ArgumentParser(description="Translate SRT subtitles using Zhipu AI")
    parser.add_argument("input", help="Input SRT file path")
    parser.add_argument("output", help="Output SRT file path")
    parser.add_argument("--txt", help="Output clean text file path")
    parser.add_argument("--model", default="glm-4.7", help="Zhipu AI model to use")
    parser.add_argument("--source-lang", default="English", help="Source language")
    parser.add_argument("--target-lang", default="Chinese", help="Target language")
    parser.add_argument("--chunk-size", type=int, default=50, help="Subtitles per chunk")
    parser.add_argument("--no-deduplicate", action="store_true", help="Skip deduplication")

    args = parser.parse_args()

    import asyncio

    async def run():
        result = await translate_srt_file(
            srt_input_path=args.input,
            srt_output_path=args.output,
            txt_output_path=args.txt,
            model=args.model,
            source_lang=args.source_lang,
            target_lang=args.target_lang,
            chunk_size=args.chunk_size,
            deduplicate=not args.no_deduplicate
        )
        print(f"✓ Translation complete: {result['translated_count']} subtitles")
        print(f"  Input:  {args.input}")
        print(f"  Output: {args.output}")
        if args.txt:
            print(f"  Text:   {args.txt}")

    asyncio.run(run())


if __name__ == "__main__":
    main()

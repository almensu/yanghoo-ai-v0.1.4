import argparse
import json
import sys
import os
import re
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler

def main():
    parser = argparse.ArgumentParser(description="Yanghoo MLX LM Translation Wrapper")
    parser.add_argument("--model", required=True, help="Path or HF ID of the MLX model")
    parser.add_argument("--system-prompt", help="System prompt for translation")
    parser.add_argument("--system-prompt-file", help="Read system prompt from a UTF-8 file")
    parser.add_argument("--user-prompt", help="User prompt containing the text to translate")
    parser.add_argument("--user-prompt-file", help="Read user prompt from a UTF-8 file")
    parser.add_argument("--max-tokens", type=int, default=2000, help="Maximum tokens to generate")
    parser.add_argument("--temp", type=float, default=0.3, help="Temperature for generation")
    parser.add_argument("--output-json", help="Path to save the output as JSON")

    args = parser.parse_args()

    try:
        system_prompt = read_prompt_arg(args.system_prompt, args.system_prompt_file)
        user_prompt = read_prompt_arg(args.user_prompt, args.user_prompt_file)
        if not user_prompt:
            raise ValueError("Either --user-prompt or --user-prompt-file is required")

        model, tokenizer = load(args.model)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        if hasattr(tokenizer, "apply_chat_template") and getattr(tokenizer, "chat_template", None):
            prompt = apply_chat_template_without_thinking(tokenizer, messages)
        else:
            prompt = ""
            if system_prompt:
                prompt += system_prompt.strip() + "\n\n"
            prompt += user_prompt.strip()

        response = generate(
            model,
            tokenizer,
            prompt=prompt,
            max_tokens=args.max_tokens,
            sampler=make_sampler(temp=args.temp),
            verbose=False # Set to True for debugging if needed
        )

        output = {
            "content": strip_thinking_blocks(response),
            "model": args.model,
            "usage": {
                # Usage info is not directly returned by generate() in all versions of mlx-lm
                # but we can return the string
            }
        }

        if args.output_json:
            output_dir = os.path.dirname(args.output_json)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            with open(args.output_json, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
        else:
            print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(f"Error during generation: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

def read_prompt_arg(inline_value, file_path):
    if file_path:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return inline_value or ""

def apply_chat_template_without_thinking(tokenizer, messages):
    try:
        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=False,
        )
    except TypeError:
        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

def strip_thinking_blocks(text):
    cleaned = re.sub(r"(?s)^\s*<think>.*?</think>\s*", "", text or "")
    return cleaned.strip()

if __name__ == "__main__":
    main()

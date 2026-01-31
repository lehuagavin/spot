#!/usr/bin/env python3
"""
Batch generate AI images with variations using Google Gemini API.

Usage:
    python batch_generate.py <prompt> --count <n> [--style <style>] [--output-dir <dir>]

Examples:
    python batch_generate.py "A magical forest" --count 4
    python batch_generate.py "A cute robot" --count 3 --style pixar
"""

import argparse
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai not installed. Run: pip install google-genai")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Error: pillow not installed. Run: pip install pillow")
    sys.exit(1)


# Import style presets from generate_image
STYLE_PRESETS = {
    "ghibli": "in the style of Studio Ghibli anime, soft pastel colors, whimsical atmosphere, hand-drawn aesthetic, dreamy and magical",
    "pixar": "in Pixar 3D animation style, vibrant colors, expressive characters, smooth rendering, cinematic lighting",
    "futuristic": "in futuristic sci-fi style, sleek design, advanced technology, clean lines, holographic elements",
    "cyberpunk": "in cyberpunk aesthetic, neon lights, dark urban environment, rain-soaked streets, high-tech low-life",
    "oil-painting": "as a classical oil painting, rich textures, dramatic lighting, masterful brushstrokes, museum quality",
    "watercolor": "as a soft watercolor painting, flowing colors, gentle gradients, artistic washes, delicate details",
    "chinese-painting": "in traditional Chinese ink painting style (水墨画), elegant brushwork, minimalist composition, spiritual atmosphere, with seal stamps",
    "japanese-ukiyo-e": "in Japanese ukiyo-e woodblock print style, bold outlines, flat colors, traditional composition",
    "impressionist": "in Impressionist painting style, visible brushstrokes, vibrant light effects, outdoor scenes, like Monet",
    "minimalist": "in minimalist design style, clean lines, simple shapes, limited color palette, modern aesthetic",
    "retro": "in vintage retro style, warm tones, nostalgic atmosphere, 1970s-80s aesthetic",
    "fantasy": "in fantasy art style, magical elements, ethereal lighting, mythical creatures, epic composition",
    "anime": "in modern anime style, vibrant colors, dynamic poses, expressive eyes, detailed backgrounds",
    "realistic": "photorealistic, highly detailed, natural lighting, sharp focus, 8K resolution",
    "cartoon": "in cartoon style, bold outlines, bright colors, exaggerated features, playful design",
    "sketch": "as a detailed pencil sketch, fine lines, shading, artistic hatching, hand-drawn look",
}

# Variation modifiers to create different versions
VARIATION_MODIFIERS = [
    "",  # Original
    ", with morning light",
    ", at golden hour",
    ", with dramatic lighting",
    ", from a different angle",
    ", close-up view",
    ", wide shot",
    ", with vibrant colors",
    ", with soft muted tones",
    ", with high contrast",
]


def get_api_key():
    """Get API key from environment variable."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        sys.exit(1)
    return api_key


def build_prompt(base_prompt: str, style: str = None, variation: str = "") -> str:
    """Build the final prompt with optional style and variation."""
    prompt = base_prompt
    
    if style and style in STYLE_PRESETS:
        prompt = f"{prompt}, {STYLE_PRESETS[style]}"
    elif style:
        prompt = f"{prompt}, in {style} style"
    
    if variation:
        prompt = f"{prompt}{variation}"
    
    return prompt


def generate_single_image(client, prompt: str, output_path: str, model: str):
    """Generate a single image."""
    try:
        response = client.models.generate_content(
            model=model,
            contents=[prompt],
        )
        
        for part in response.parts:
            if part.inline_data is not None:
                image = part.as_image()
                output_file = Path(output_path)
                output_file.parent.mkdir(parents=True, exist_ok=True)
                image.save(str(output_file))
                return True
        
        return False
        
    except Exception as e:
        print(f"  Error: {e}")
        return False


def batch_generate(prompt: str, count: int, style: str, output_dir: str, model: str):
    """Generate multiple images with variations."""
    api_key = get_api_key()
    client = genai.Client(api_key=api_key)
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Generate timestamp for unique filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print(f"Generating {count} images...")
    print(f"Base prompt: {prompt}")
    if style:
        print(f"Style: {style}")
    print(f"Output directory: {output_path}")
    print(f"Model: {model}")
    print("-" * 50)
    
    success_count = 0
    
    for i in range(count):
        # Select variation modifier
        variation = VARIATION_MODIFIERS[i % len(VARIATION_MODIFIERS)]
        
        # Build final prompt
        final_prompt = build_prompt(prompt, style, variation)
        
        # Generate filename
        style_suffix = f"_{style}" if style else ""
        filename = f"image_{timestamp}_{i+1:02d}{style_suffix}.png"
        output_file = output_path / filename
        
        print(f"\n[{i+1}/{count}] Generating...")
        if variation:
            print(f"  Variation: {variation.strip(', ')}")
        
        success = generate_single_image(client, final_prompt, str(output_file), model)
        
        if success:
            print(f"  Saved: {filename}")
            success_count += 1
        else:
            print(f"  Failed to generate image")
    
    print("\n" + "=" * 50)
    print(f"Batch generation complete: {success_count}/{count} images generated")
    print(f"Output directory: {output_path}")
    
    return success_count


def main():
    parser = argparse.ArgumentParser(
        description="Batch generate AI images with variations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("prompt", help="Base image generation prompt")
    parser.add_argument("--count", "-c", type=int, default=4, help="Number of images to generate")
    parser.add_argument("--style", "-s", help="Style preset to apply")
    parser.add_argument("--output-dir", "-o", default="./generated", help="Output directory")
    parser.add_argument("--model", "-m", default="gemini-3-pro-image-preview", help="Model name")
    
    args = parser.parse_args()
    
    if args.count < 1 or args.count > 10:
        print("Error: Count must be between 1 and 10")
        sys.exit(1)
    
    batch_generate(args.prompt, args.count, args.style, args.output_dir, args.model)


if __name__ == "__main__":
    main()

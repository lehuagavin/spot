#!/usr/bin/env python3
"""
Generate AI images using Google Gemini API.

Usage:
    python generate_image.py <prompt> [--style <style>] [--output <path>]

Examples:
    python generate_image.py "A serene mountain landscape"
    python generate_image.py "A cat playing piano" --style ghibli
    python generate_image.py "A futuristic city" --style cyberpunk --output city.png
"""

import argparse
import os
import sys
from pathlib import Path

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


# Style presets with detailed prompts
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


def get_api_key():
    """Get API key from environment variable."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        print("Please set it with: export GEMINI_API_KEY='your-api-key'")
        sys.exit(1)
    return api_key


def build_prompt(base_prompt: str, style: str = None) -> str:
    """Build the final prompt with optional style."""
    if style and style in STYLE_PRESETS:
        return f"{base_prompt}, {STYLE_PRESETS[style]}"
    elif style:
        # Custom style not in presets
        return f"{base_prompt}, in {style} style"
    return base_prompt


def generate_image(prompt: str, output_path: str, model: str = "gemini-3-pro-image-preview"):
    """Generate an image using Gemini API."""
    api_key = get_api_key()
    
    # Initialize client
    client = genai.Client(api_key=api_key)
    
    print(f"Generating image with prompt: {prompt[:100]}...")
    print(f"Model: {model}")
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=[prompt],
        )
        
        # Process response
        image_saved = False
        text_response = None
        
        for part in response.parts:
            if part.text is not None:
                text_response = part.text
                print(f"Model response: {part.text}")
            elif part.inline_data is not None:
                image = part.as_image()
                
                # Ensure output directory exists
                output_file = Path(output_path)
                output_file.parent.mkdir(parents=True, exist_ok=True)
                
                image.save(str(output_file))
                image_saved = True
                print(f"Image saved to: {output_file}")
        
        if not image_saved:
            print("Warning: No image was generated in the response")
            if text_response:
                print(f"Model said: {text_response}")
            return False
            
        return True
        
    except Exception as e:
        print(f"Error generating image: {e}")
        return False


def list_styles():
    """Print available style presets."""
    print("\nAvailable Style Presets:")
    print("-" * 60)
    for name, description in STYLE_PRESETS.items():
        # Truncate description for display
        short_desc = description[:50] + "..." if len(description) > 50 else description
        print(f"  {name:20} {short_desc}")
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Generate AI images using Google Gemini API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "A serene mountain landscape at sunset"
  %(prog)s "A cat playing piano" --style ghibli
  %(prog)s "A futuristic city" -s cyberpunk -o city.png
  %(prog)s --list-styles
        """
    )
    parser.add_argument("prompt", nargs="?", help="Image generation prompt")
    parser.add_argument("--style", "-s", help="Style preset to apply")
    parser.add_argument("--output", "-o", default="generated_image.png", help="Output file path")
    parser.add_argument("--model", "-m", default="gemini-3-pro-image-preview", help="Model name")
    parser.add_argument("--list-styles", action="store_true", help="List available style presets")
    
    args = parser.parse_args()
    
    if args.list_styles:
        list_styles()
        return
    
    if not args.prompt:
        parser.print_help()
        print("\nError: Please provide a prompt")
        sys.exit(1)
    
    # Build final prompt with style
    final_prompt = build_prompt(args.prompt, args.style)
    
    if args.style:
        print(f"Style: {args.style}")
    
    # Generate image
    success = generate_image(final_prompt, args.output, args.model)
    
    if success:
        print("\nImage generation complete!")
    else:
        print("\nImage generation failed")
        sys.exit(1)


if __name__ == "__main__":
    main()

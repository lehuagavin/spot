---
name: gemini-image-gen
description: Generate AI images using Google Gemini API with various artistic styles. Use when the user wants to create images, generate artwork, or mentions image generation with specific styles like Ghibli, Futuristic, Pixar, Oil Painting, Chinese Painting, Watercolor, Anime, Cyberpunk, etc.
---

# Gemini Image Generation

Generate AI images using Google Gemini API with support for various artistic styles.

## Prerequisites

Set the `GEMINI_API_KEY` environment variable with your Google AI API key:

```bash
export GEMINI_API_KEY="your-api-key"
```

## Usage

### Basic Image Generation

```bash
python scripts/generate_image.py "A serene mountain landscape at sunset"
```

### With Style Presets

```bash
python scripts/generate_image.py "A cat playing piano" --style ghibli
python scripts/generate_image.py "A futuristic city" --style cyberpunk
python scripts/generate_image.py "A beautiful garden" --style chinese-painting
```

### Custom Output

```bash
python scripts/generate_image.py "prompt" --output ./my-image.png
```

## Available Style Presets

| Style | Description |
|-------|-------------|
| `ghibli` | Studio Ghibli anime style, soft colors, whimsical |
| `pixar` | Pixar 3D animation style, vibrant, expressive |
| `futuristic` | Sci-fi futuristic style, sleek, technological |
| `cyberpunk` | Cyberpunk aesthetic, neon, dark urban |
| `oil-painting` | Classical oil painting style, rich textures |
| `watercolor` | Soft watercolor painting style |
| `chinese-painting` | Traditional Chinese ink painting style |
| `japanese-ukiyo-e` | Japanese woodblock print style |
| `impressionist` | Impressionist painting style |
| `minimalist` | Clean minimalist design |
| `retro` | Vintage retro aesthetic |
| `fantasy` | Fantasy art style, magical elements |

## Script Reference

### generate_image.py

Main image generation script.

```bash
python scripts/generate_image.py <prompt> [options]

Options:
  --style, -s       Style preset to apply
  --output, -o      Output file path (default: generated_image.png)
  --model, -m       Model name (default: gemini-3-pro-image-preview)
```

### batch_generate.py

Generate multiple images with variations.

```bash
python scripts/batch_generate.py <prompt> --count 4 --style ghibli
```

## Example Prompts

### Landscape
```
"A peaceful Japanese garden with cherry blossoms, koi pond, and wooden bridge"
```

### Character
```
"A wise old wizard reading an ancient book in a magical library"
```

### Abstract
```
"Abstract representation of music and emotions, flowing colors"
```

## Dependencies

```bash
pip install google-genai pillow
```

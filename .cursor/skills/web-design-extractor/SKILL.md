---
name: web-design-extractor
description: Extract design tokens and reverse-engineer website designs to create pixel-perfect reproductions. Use when the user asks to analyze a website's design, extract a design system from a URL, create a design guide from a webpage, reproduce/clone a website's look and feel, or needs to understand and replicate visual design patterns from an existing site.
---

# Web Design Extractor

This skill enables pixel-perfect reproduction of website designs by extracting design tokens, capturing screenshots, and generating comprehensive design guides.

## Workflow Overview

```
URL Input → Extract Design → Capture Screenshots → Generate Guide → Rebuild Page → Compare → Iterate
```

## Step 1: Extract Design Tokens

Run the extraction script to analyze the website's CSS and design elements:

```bash
python scripts/extract_design.py <url> --output ./output --viewport 1600x1200
```

This extracts:
- Color palette (categorized by usage)
- Typography scale (fonts, sizes, weights, line-heights)
- Spacing values
- Border radius values
- Box shadows and text shadows
- Transitions and animations
- CSS custom properties (variables)
- Layout patterns (grid, flexbox, containers)
- Interactive states (buttons, links, inputs)

Output: `output/design-tokens.json`

## Step 2: Capture Screenshots

Capture reference screenshots for visual comparison:

```bash
python scripts/capture_screenshot.py <url> --output ./output --viewport 1600x1200 --full-page --hover-states
```

Options:
- `--viewport 1600x1200` - Set viewport size (default: 1600x1200)
- `--full-page` - Capture entire scrollable page
- `--hover-states` - Capture interactive element states

Output: `output/<domain>_viewport.png`, `output/<domain>_fullpage.png`

## Step 3: Generate Design Guide

Create a comprehensive design guide markdown file:

```bash
python scripts/generate_guide.py output/design-tokens.json --output ./styles/design-guide.md
```

The generated guide includes:
- Color palette with hex/RGB values
- Typography scale with CSS code
- Spacing system
- Shadow and effect definitions
- Layout patterns
- Implementation guidelines

## Step 4: Rebuild the Page

Using the design guide and screenshots, create an HTML reproduction:

1. Read the design guide to understand the design system
2. Examine the screenshots for visual reference
3. Create `/tmp/test.html` with the extracted design tokens
4. Apply styles matching the original

**Critical implementation order:**
1. Set up CSS variables from the design guide
2. Implement typography (fonts, sizes, weights)
3. Apply color palette
4. Add spacing and layout
5. Implement shadows and effects
6. Add hover states and transitions

## Step 5: Compare and Iterate

Compare your rebuild with the original:

```bash
python scripts/compare_pages.py output/<domain>_viewport.png /tmp/test_screenshot.png --output ./comparison --threshold 0.95
```

The comparison provides:
- Pixel similarity score (0-100%)
- Structural similarity score
- Visual diff image
- Heatmap highlighting differences
- Region-by-region analysis

**Iteration process:**
1. Review the comparison heatmap
2. Identify areas with low similarity
3. Adjust CSS to match the original more closely
4. Re-capture and compare again
5. Repeat until similarity ≥ 95%

## Step 6: Finalize Deliverables

Once pixel-perfect, deliver:
1. `./styles/design-guide.md` - Complete design documentation
2. `./styles/rebuilt.html` - Pixel-perfect reproduction

## Quick Reference

### All Scripts

| Script | Purpose |
|--------|---------|
| `extract_design.py` | Extract CSS and design tokens |
| `capture_screenshot.py` | Capture viewport and full-page screenshots |
| `generate_guide.py` | Generate design guide markdown |
| `compare_pages.py` | Compare screenshots for similarity |

### Common Viewport Sizes

| Size | Usage |
|------|-------|
| 1920x1080 | Full HD desktop |
| 1600x1200 | Standard desktop (recommended) |
| 1440x900 | Laptop |
| 1280x720 | Smaller desktop |

### Similarity Thresholds

| Score | Quality |
|-------|---------|
| 95%+ | Pixel-perfect |
| 90-95% | Excellent |
| 80-90% | Good |
| <80% | Needs work |

## Design Token Reference

For detailed information about interpreting extracted design tokens, see `references/design-tokens-guide.md`.

## Dependencies

Ensure these are installed before using:

```bash
pip install playwright pillow numpy
playwright install chromium
```

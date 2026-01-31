# Design Tokens Reference Guide

This guide explains the design tokens extracted by the web-design-extractor skill and how to interpret them for pixel-perfect reproduction.

## Design Token Categories

### Colors

Colors are extracted from all CSS color properties and categorized automatically:

| Category | Usage | Properties Scanned |
|----------|-------|-------------------|
| Primary | Main brand/action colors | `color`, `background-color` |
| Secondary | Supporting colors | `color`, `background-color` |
| Accent | Highlights, CTAs | `color`, `background-color` |
| Neutral | Grays, text backgrounds | `color`, `background-color` |
| Text | Body text colors | `color` |
| Background | Section backgrounds | `background-color` |
| Border | Dividers, outlines | `border-color`, `outline-color` |

**Tips for color matching:**
- Use a color picker tool to verify hex values
- Check colors in both light and dark contexts
- Some colors may appear in gradients or shadows

### Typography

Typography tokens capture the complete text styling hierarchy:

```
Font Properties Extracted:
├── fontFamily     - The typeface(s) used
├── fontSize       - Size in pixels
├── fontWeight     - Weight (100-900 or keywords)
├── lineHeight     - Line spacing
├── letterSpacing  - Character spacing
├── textTransform  - Case transformation (uppercase, etc.)
└── color          - Text color
```

**Font loading considerations:**
- Check if fonts are Google Fonts, Adobe Fonts, or self-hosted
- System fonts (like `-apple-system`) don't need loading
- Variable fonts may have different weight values

### Spacing

Spacing values represent the design's spacing scale:

| Value Range | Typical Usage |
|-------------|---------------|
| 0-8px | Tight spacing, borders |
| 8-16px | Element padding |
| 16-24px | Component spacing |
| 24-48px | Section padding |
| 48px+ | Large section gaps |

**Building a spacing scale:**
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
}
```

### Border Radius

Border radius values define the "roundness" of UI elements:

| Value | Description |
|-------|-------------|
| 0px | Sharp corners |
| 2-4px | Subtle rounding |
| 8-12px | Noticeable rounding |
| 16px+ | Very rounded |
| 50% or 9999px | Circular/pill shape |

### Shadows

Box shadows create depth and elevation:

```css
/* Common shadow patterns */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);      /* Subtle */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);       /* Cards */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);     /* Modals */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);    /* Dropdowns */
```

### Transitions & Animations

Effects extracted include:

| Property | Common Values |
|----------|---------------|
| transition-duration | 150ms, 200ms, 300ms |
| transition-timing-function | ease, ease-in-out, cubic-bezier(...) |
| animation-name | fadeIn, slideUp, etc. |

## Interpreting Layout Information

### Container Widths

Common container patterns:
- `max-width: 1200px` - Standard content width
- `max-width: 1440px` - Wide content
- `max-width: 100%` - Full width

### Grid Layouts

Grid template columns reveal layout structure:
- `1fr 1fr 1fr` - Equal thirds
- `repeat(4, 1fr)` - Four equal columns
- `200px 1fr` - Sidebar + main content

### Flexbox Patterns

Common flex configurations:
| Pattern | Usage |
|---------|-------|
| `row / space-between / center` | Navigation bars |
| `column / flex-start / stretch` | Card content |
| `row / center / center` | Centered content |
| `row-reverse / flex-end / center` | RTL layouts |

## CSS Variables Mapping

Map extracted CSS variables to your design system:

```css
/* Original site */
--primary-color: #3b82f6;
--spacing-unit: 8px;

/* Your implementation */
:root {
  --color-primary: var(--primary-color);
  --space-unit: var(--spacing-unit);
}
```

## Pixel-Perfect Checklist

Use this checklist when verifying your reproduction:

### Typography
- [ ] Font family matches exactly
- [ ] Font weights are correct
- [ ] Font sizes match at all breakpoints
- [ ] Line heights are accurate
- [ ] Letter spacing is applied

### Colors
- [ ] Primary colors are exact matches
- [ ] Hover states use correct colors
- [ ] Gradients are replicated correctly
- [ ] Opacity values are accurate

### Spacing
- [ ] Margins match the original
- [ ] Padding is consistent
- [ ] Gap values in flex/grid are correct
- [ ] Section spacing is accurate

### Visual Effects
- [ ] Border radius values match
- [ ] Box shadows are replicated
- [ ] Transitions have correct timing
- [ ] Animations are recreated

### Layout
- [ ] Container widths are correct
- [ ] Grid columns/rows match
- [ ] Flexbox alignment is accurate
- [ ] Responsive breakpoints work

## Common Issues & Solutions

### Font Rendering Differences

```css
/* Improve font rendering */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

### Sub-pixel Rendering

```css
/* Avoid sub-pixel issues */
transform: translateZ(0);
backface-visibility: hidden;
```

### Color Space Differences

Some colors may appear different due to color space:
- Check if site uses `sRGB` vs `Display P3`
- Use `color-mix()` for modern color blending

### Shadow Rendering

```css
/* Improve shadow rendering */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
```

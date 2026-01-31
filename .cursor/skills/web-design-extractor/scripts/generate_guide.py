#!/usr/bin/env python3
"""
Generate a design guide markdown file from extracted design tokens.

Usage:
    python generate_guide.py <design_tokens_json> [--output <output_file>] [--url <source_url>]

Examples:
    python generate_guide.py design-tokens.json
    python generate_guide.py design-tokens.json --output design-guide.md
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path


def rgb_to_hex(rgb_string):
    """Convert RGB/RGBA string to hex color."""
    if not rgb_string:
        return None
    
    match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', rgb_string)
    if match:
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return f"#{r:02x}{g:02x}{b:02x}"
    return rgb_string


def format_color_table(colors, title):
    """Format a color list as a markdown table."""
    if not colors:
        return ""
    
    lines = [f"\n#### {title}\n"]
    lines.append("| Color | Hex | RGB |")
    lines.append("|-------|-----|-----|")
    
    seen = set()
    for color in colors:
        if isinstance(color, dict):
            hex_val = color.get("hex", "")
            rgb_val = color.get("rgb", "")
        else:
            rgb_val = color
            hex_val = rgb_to_hex(color)
        
        if hex_val and hex_val not in seen:
            seen.add(hex_val)
            lines.append(f"| ![{hex_val}](https://via.placeholder.com/20/{hex_val.replace('#', '')}/{hex_val.replace('#', '')}) | `{hex_val}` | `{rgb_val}` |")
    
    return "\n".join(lines)


def format_typography_section(typography):
    """Format typography information."""
    if not typography:
        return ""
    
    lines = ["\n### Typography Scale\n"]
    lines.append("| Element | Font Family | Size | Weight | Line Height | Color |")
    lines.append("|---------|-------------|------|--------|-------------|-------|")
    
    for name, props in typography.items():
        font = props.get("fontFamily", "").split(",")[0].strip("'\"") if props.get("fontFamily") else "-"
        size = props.get("fontSize", "-")
        weight = props.get("fontWeight", "-")
        line_height = props.get("lineHeight", "-")
        color = rgb_to_hex(props.get("color", "")) or "-"
        
        lines.append(f"| {name} | `{font}` | `{size}` | `{weight}` | `{line_height}` | `{color}` |")
    
    return "\n".join(lines)


def format_spacing_section(spacing):
    """Format spacing values."""
    if not spacing:
        return ""
    
    lines = ["\n### Spacing Scale\n"]
    lines.append("Use consistent spacing values from this scale:\n")
    lines.append("```css")
    
    for space in spacing[:20]:
        px_val = int(space.replace("px", ""))
        rem_val = px_val / 16
        lines.append(f"--spacing-{px_val}: {space}; /* {rem_val:.3f}rem */")
    
    lines.append("```")
    return "\n".join(lines)


def format_shadows_section(shadows):
    """Format shadow values."""
    if not shadows:
        return ""
    
    lines = ["\n### Shadows\n"]
    
    box_shadows = shadows.get("boxShadows", [])
    if box_shadows:
        lines.append("#### Box Shadows\n")
        lines.append("```css")
        for i, shadow in enumerate(box_shadows[:10]):
            lines.append(f"--shadow-{i + 1}: {shadow};")
        lines.append("```")
    
    text_shadows = shadows.get("textShadows", [])
    if text_shadows:
        lines.append("\n#### Text Shadows\n")
        lines.append("```css")
        for i, shadow in enumerate(text_shadows[:10]):
            lines.append(f"--text-shadow-{i + 1}: {shadow};")
        lines.append("```")
    
    return "\n".join(lines)


def format_effects_section(effects):
    """Format transitions and animations."""
    if not effects:
        return ""
    
    lines = ["\n### Effects & Animations\n"]
    
    transitions = effects.get("transitions", [])
    if transitions:
        lines.append("#### Transitions\n")
        lines.append("```css")
        for transition in transitions[:10]:
            lines.append(f"transition: {transition};")
        lines.append("```")
    
    animations = effects.get("animations", [])
    if animations:
        lines.append("\n#### Animations\n")
        lines.append("```css")
        for animation in animations[:10]:
            lines.append(f"animation: {animation};")
        lines.append("```")
    
    return "\n".join(lines)


def format_css_variables(variables):
    """Format CSS custom properties."""
    if not variables:
        return ""
    
    lines = ["\n### CSS Custom Properties\n"]
    lines.append("The original site uses these CSS variables:\n")
    lines.append("```css")
    lines.append(":root {")
    
    for name, value in list(variables.items())[:50]:
        lines.append(f"  {name}: {value};")
    
    lines.append("}")
    lines.append("```")
    return "\n".join(lines)


def format_border_radius(radii):
    """Format border radius values."""
    if not radii:
        return ""
    
    lines = ["\n### Border Radius\n"]
    lines.append("```css")
    
    for i, radius in enumerate(radii[:10]):
        lines.append(f"--radius-{i + 1}: {radius};")
    
    lines.append("```")
    return "\n".join(lines)


def format_layout_section(layout):
    """Format layout information."""
    if not layout:
        return ""
    
    lines = ["\n### Layout Patterns\n"]
    
    containers = layout.get("containers", [])
    if containers:
        lines.append("#### Container Widths\n")
        seen_widths = set()
        for container in containers[:10]:
            max_width = container.get("maxWidth")
            if max_width and max_width not in seen_widths:
                seen_widths.add(max_width)
                lines.append(f"- `max-width: {max_width}` - {container.get('tag', 'div')}")
    
    grids = layout.get("grids", [])
    if grids:
        lines.append("\n#### Grid Layouts\n")
        lines.append("```css")
        for grid in grids[:5]:
            lines.append(f"/* {grid.get('tag', 'div')}.{grid.get('class', '')} */")
            lines.append("display: grid;")
            if grid.get("gridTemplateColumns"):
                lines.append(f"grid-template-columns: {grid['gridTemplateColumns']};")
            if grid.get("gap"):
                lines.append(f"gap: {grid['gap']};")
            lines.append("")
        lines.append("```")
    
    flexboxes = layout.get("flexboxes", [])
    if flexboxes:
        lines.append("\n#### Flexbox Layouts\n")
        lines.append("Common flex patterns used:\n")
        patterns = set()
        for flex in flexboxes[:20]:
            pattern = f"{flex.get('flexDirection', 'row')} | {flex.get('justifyContent', 'flex-start')} | {flex.get('alignItems', 'stretch')}"
            patterns.add(pattern)
        
        lines.append("| Direction | Justify | Align |")
        lines.append("|-----------|---------|-------|")
        for pattern in list(patterns)[:10]:
            parts = pattern.split(" | ")
            lines.append(f"| `{parts[0]}` | `{parts[1]}` | `{parts[2]}` |")
    
    return "\n".join(lines)


def generate_design_guide(tokens, output_path):
    """Generate the complete design guide markdown."""
    
    lines = []
    
    lines.append("# Design Guide\n")
    lines.append(f"> Extracted from: {tokens.get('url', 'Unknown URL')}")
    lines.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"> Viewport: {tokens.get('viewport', {}).get('width', '?')}x{tokens.get('viewport', {}).get('height', '?')}")
    lines.append("")
    
    lines.append("## Table of Contents\n")
    lines.append("1. [Color Palette](#color-palette)")
    lines.append("2. [Typography](#typography)")
    lines.append("3. [Spacing](#spacing)")
    lines.append("4. [Borders & Radius](#borders--radius)")
    lines.append("5. [Shadows & Effects](#shadows--effects)")
    lines.append("6. [Layout](#layout)")
    lines.append("7. [CSS Variables](#css-variables)")
    lines.append("8. [Implementation Guide](#implementation-guide)")
    lines.append("")
    
    lines.append("---\n")
    lines.append("## Color Palette\n")
    
    colors = tokens.get("colors", {})
    categorized = colors.get("categorized", {})
    
    if categorized:
        for category, color_list in categorized.items():
            if color_list:
                lines.append(format_color_table(color_list, category.title()))
    else:
        raw_colors = colors.get("raw", [])
        lines.append(format_color_table(raw_colors, "All Colors"))
    
    lines.append("\n---\n")
    lines.append("## Typography\n")
    
    fonts = tokens.get("fonts", [])
    if fonts:
        lines.append("### Font Families\n")
        lines.append("```css")
        lines.append(f"--font-primary: {fonts[0] if fonts else 'sans-serif'};")
        if len(fonts) > 1:
            lines.append(f"--font-secondary: {fonts[1]};")
        if len(fonts) > 2:
            lines.append(f"--font-mono: {fonts[2]};")
        lines.append("```\n")
    
    lines.append(format_typography_section(tokens.get("typography", {})))
    
    lines.append("\n---\n")
    lines.append("## Spacing\n")
    lines.append(format_spacing_section(tokens.get("spacing", [])))
    
    lines.append("\n---\n")
    lines.append("## Borders & Radius\n")
    lines.append(format_border_radius(tokens.get("borderRadius", [])))
    
    lines.append("\n---\n")
    lines.append("## Shadows & Effects\n")
    lines.append(format_shadows_section(tokens.get("shadows", {})))
    lines.append(format_effects_section(tokens.get("effects", {})))
    
    lines.append("\n---\n")
    lines.append("## Layout\n")
    lines.append(format_layout_section(tokens.get("layout", {})))
    
    lines.append("\n---\n")
    lines.append("## CSS Variables\n")
    lines.append(format_css_variables(tokens.get("cssVariables", {})))
    
    lines.append("\n---\n")
    lines.append("## Implementation Guide\n")
    lines.append("""
### Quick Start

1. **Set up CSS variables** - Copy the color palette and typography variables to your stylesheet's `:root`
2. **Apply base styles** - Set up body typography and background
3. **Use the spacing scale** - Apply consistent spacing using the extracted values
4. **Match interactive states** - Implement hover effects and transitions as documented

### CSS Reset Recommendations

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Responsive Considerations

The design tokens were extracted at a specific viewport size. Consider:
- Testing at multiple breakpoints
- Using relative units (rem, em, %) where appropriate
- Implementing fluid typography if needed

### Accessibility Checklist

- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Interactive elements have visible focus states
- [ ] Typography is readable at all sizes
- [ ] Animations respect `prefers-reduced-motion`
""")
    
    content = "\n".join(lines)
    Path(output_path).write_text(content, encoding="utf-8")
    
    return content


def main():
    parser = argparse.ArgumentParser(description="Generate design guide from extracted tokens")
    parser.add_argument("tokens_file", help="Path to design-tokens.json")
    parser.add_argument("--output", "-o", default="design-guide.md", help="Output markdown file")
    
    args = parser.parse_args()
    
    tokens_path = Path(args.tokens_file)
    if not tokens_path.exists():
        print(f"Error: Tokens file not found: {args.tokens_file}")
        sys.exit(1)
    
    with open(tokens_path, "r", encoding="utf-8") as f:
        tokens = json.load(f)
    
    print(f"Generating design guide from: {args.tokens_file}")
    print(f"Output: {args.output}")
    
    generate_design_guide(tokens, args.output)
    
    print(f"\nDesign guide generated successfully!")
    print(f"File: {args.output}")


if __name__ == "__main__":
    main()

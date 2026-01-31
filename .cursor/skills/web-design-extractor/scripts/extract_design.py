#!/usr/bin/env python3
"""
Extract design tokens and CSS styles from a webpage using Playwright.

Usage:
    python extract_design.py <url> [--output <output_dir>] [--viewport <width>x<height>]

Examples:
    python extract_design.py https://example.com
    python extract_design.py https://example.com --output ./output
    python extract_design.py https://example.com --viewport 1600x1200
"""

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)


def extract_computed_styles(page, selector="body"):
    """Extract computed styles from an element."""
    return page.evaluate(f"""() => {{
        const element = document.querySelector('{selector}');
        if (!element) return null;
        const styles = window.getComputedStyle(element);
        return {{
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
        }};
    }}""")


def extract_all_colors(page):
    """Extract all unique colors used on the page."""
    return page.evaluate("""() => {
        const colors = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const colorProps = [
                'color', 'backgroundColor', 'borderColor', 
                'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                'outlineColor', 'boxShadow', 'textShadow'
            ];
            
            colorProps.forEach(prop => {
                const value = styles[prop];
                if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'none') {
                    // Extract colors from complex values like box-shadow
                    const rgbMatches = value.match(/rgba?\\([^)]+\\)/g);
                    if (rgbMatches) {
                        rgbMatches.forEach(c => colors.add(c));
                    }
                }
            });
        });
        
        return Array.from(colors);
    }""")


def extract_all_fonts(page):
    """Extract all unique fonts used on the page."""
    return page.evaluate("""() => {
        const fonts = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontFamily = styles.fontFamily;
            if (fontFamily) {
                // Split font family and add each
                fontFamily.split(',').forEach(f => {
                    fonts.add(f.trim().replace(/['"]/g, ''));
                });
            }
        });
        
        return Array.from(fonts);
    }""")


def extract_typography(page):
    """Extract typography information from headings and body text."""
    return page.evaluate("""() => {
        const typography = {};
        const selectors = {
            'h1': 'Heading 1',
            'h2': 'Heading 2', 
            'h3': 'Heading 3',
            'h4': 'Heading 4',
            'h5': 'Heading 5',
            'h6': 'Heading 6',
            'p': 'Paragraph',
            'a': 'Link',
            'button': 'Button',
            'input': 'Input',
            'label': 'Label',
            'span': 'Span'
        };
        
        for (const [selector, name] of Object.entries(selectors)) {
            const element = document.querySelector(selector);
            if (element) {
                const styles = window.getComputedStyle(element);
                typography[name] = {
                    selector: selector,
                    fontFamily: styles.fontFamily,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight,
                    letterSpacing: styles.letterSpacing,
                    textTransform: styles.textTransform,
                    color: styles.color
                };
            }
        }
        
        return typography;
    }""")


def extract_spacing(page):
    """Extract common spacing values from the page."""
    return page.evaluate("""() => {
        const spacings = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const props = [
                'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'gap', 'rowGap', 'columnGap'
            ];
            
            props.forEach(prop => {
                const value = styles[prop];
                if (value && value !== '0px' && value !== 'auto' && value !== 'normal') {
                    // Extract numeric values
                    const matches = value.match(/\\d+px/g);
                    if (matches) {
                        matches.forEach(m => spacings.add(m));
                    }
                }
            });
        });
        
        return Array.from(spacings).sort((a, b) => parseInt(a) - parseInt(b));
    }""")


def extract_border_radius(page):
    """Extract border-radius values used on the page."""
    return page.evaluate("""() => {
        const radii = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const radius = styles.borderRadius;
            if (radius && radius !== '0px') {
                radii.add(radius);
            }
        });
        
        return Array.from(radii);
    }""")


def extract_shadows(page):
    """Extract box-shadow and text-shadow values."""
    return page.evaluate("""() => {
        const shadows = { boxShadows: new Set(), textShadows: new Set() };
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            
            const boxShadow = styles.boxShadow;
            if (boxShadow && boxShadow !== 'none') {
                shadows.boxShadows.add(boxShadow);
            }
            
            const textShadow = styles.textShadow;
            if (textShadow && textShadow !== 'none') {
                shadows.textShadows.add(textShadow);
            }
        });
        
        return {
            boxShadows: Array.from(shadows.boxShadows),
            textShadows: Array.from(shadows.textShadows)
        };
    }""")


def extract_transitions_animations(page):
    """Extract transition and animation properties."""
    return page.evaluate("""() => {
        const effects = { transitions: new Set(), animations: new Set() };
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            
            const transition = styles.transition;
            if (transition && transition !== 'all 0s ease 0s' && transition !== 'none') {
                effects.transitions.add(transition);
            }
            
            const animation = styles.animation;
            if (animation && animation !== 'none') {
                effects.animations.add(animation);
            }
        });
        
        return {
            transitions: Array.from(effects.transitions),
            animations: Array.from(effects.animations)
        };
    }""")


def extract_css_variables(page):
    """Extract CSS custom properties (variables) from the document."""
    return page.evaluate("""() => {
        const variables = {};
        
        // Get variables from :root
        const rootStyles = getComputedStyle(document.documentElement);
        const styleSheets = document.styleSheets;
        
        for (const sheet of styleSheets) {
            try {
                const rules = sheet.cssRules || sheet.rules;
                for (const rule of rules) {
                    if (rule.style) {
                        for (let i = 0; i < rule.style.length; i++) {
                            const prop = rule.style[i];
                            if (prop.startsWith('--')) {
                                const value = rule.style.getPropertyValue(prop).trim();
                                if (value) {
                                    variables[prop] = value;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets will throw
            }
        }
        
        return variables;
    }""")


def extract_layout_info(page):
    """Extract layout information like max-width, grid/flexbox usage."""
    return page.evaluate("""() => {
        const layout = {
            containers: [],
            grids: [],
            flexboxes: []
        };
        
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            
            // Container widths
            const maxWidth = styles.maxWidth;
            if (maxWidth && maxWidth !== 'none' && maxWidth !== '100%') {
                layout.containers.push({
                    tag: el.tagName.toLowerCase(),
                    class: el.className,
                    maxWidth: maxWidth
                });
            }
            
            // Grid layouts
            if (styles.display === 'grid' || styles.display === 'inline-grid') {
                layout.grids.push({
                    tag: el.tagName.toLowerCase(),
                    class: el.className,
                    gridTemplateColumns: styles.gridTemplateColumns,
                    gridTemplateRows: styles.gridTemplateRows,
                    gap: styles.gap
                });
            }
            
            // Flexbox layouts
            if (styles.display === 'flex' || styles.display === 'inline-flex') {
                layout.flexboxes.push({
                    tag: el.tagName.toLowerCase(),
                    class: el.className,
                    flexDirection: styles.flexDirection,
                    justifyContent: styles.justifyContent,
                    alignItems: styles.alignItems,
                    gap: styles.gap
                });
            }
        });
        
        return layout;
    }""")


def extract_interactive_states(page):
    """Extract hover, focus, and active state styles."""
    return page.evaluate("""() => {
        const states = {
            links: [],
            buttons: [],
            inputs: []
        };
        
        // Get link styles
        document.querySelectorAll('a').forEach(el => {
            const styles = window.getComputedStyle(el);
            states.links.push({
                color: styles.color,
                textDecoration: styles.textDecoration,
                cursor: styles.cursor
            });
        });
        
        // Get button styles
        document.querySelectorAll('button, [type="button"], [type="submit"]').forEach(el => {
            const styles = window.getComputedStyle(el);
            states.buttons.push({
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                border: styles.border,
                borderRadius: styles.borderRadius,
                padding: styles.padding,
                cursor: styles.cursor
            });
        });
        
        // Get input styles
        document.querySelectorAll('input, textarea, select').forEach(el => {
            const styles = window.getComputedStyle(el);
            states.inputs.push({
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                border: styles.border,
                borderRadius: styles.borderRadius,
                padding: styles.padding,
                outline: styles.outline
            });
        });
        
        return states;
    }""")


def rgb_to_hex(rgb_string):
    """Convert RGB/RGBA string to hex color."""
    if not rgb_string:
        return None
    
    match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', rgb_string)
    if match:
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return f"#{r:02x}{g:02x}{b:02x}"
    return rgb_string


def categorize_colors(colors):
    """Categorize colors into primary, secondary, accent, neutral, etc."""
    categorized = {
        "primary": [],
        "secondary": [],
        "accent": [],
        "neutral": [],
        "text": [],
        "background": [],
        "border": [],
        "other": []
    }
    
    for color in colors:
        hex_color = rgb_to_hex(color)
        if hex_color:
            match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', color)
            if match:
                r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
                brightness = (r * 299 + g * 587 + b * 114) / 1000
                
                if brightness > 240:
                    categorized["background"].append({"rgb": color, "hex": hex_color})
                elif brightness < 30:
                    categorized["text"].append({"rgb": color, "hex": hex_color})
                elif r > 200 and g < 100 and b < 100:
                    categorized["accent"].append({"rgb": color, "hex": hex_color})
                elif r < 100 and g < 100 and b > 200:
                    categorized["primary"].append({"rgb": color, "hex": hex_color})
                elif abs(r - g) < 20 and abs(g - b) < 20:
                    categorized["neutral"].append({"rgb": color, "hex": hex_color})
                else:
                    categorized["other"].append({"rgb": color, "hex": hex_color})
    
    return categorized


def main():
    parser = argparse.ArgumentParser(description="Extract design tokens from a webpage")
    parser.add_argument("url", help="URL of the webpage to analyze")
    parser.add_argument("--output", "-o", default="./output", help="Output directory")
    parser.add_argument("--viewport", "-v", default="1600x1200", help="Viewport size (WIDTHxHEIGHT)")
    parser.add_argument("--wait", "-w", type=int, default=3000, help="Wait time after load (ms)")
    
    args = parser.parse_args()
    
    viewport_parts = args.viewport.split("x")
    viewport_width = int(viewport_parts[0])
    viewport_height = int(viewport_parts[1])
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Extracting design tokens from: {args.url}")
    print(f"Viewport: {viewport_width}x{viewport_height}")
    print(f"Output directory: {output_dir}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": viewport_width, "height": viewport_height}
        )
        page = context.new_page()
        
        try:
            print("Loading page...")
            page.goto(args.url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(args.wait)
            
            print("Extracting design tokens...")
            
            design_tokens = {
                "url": args.url,
                "viewport": {"width": viewport_width, "height": viewport_height},
                "colors": {"raw": extract_all_colors(page)},
                "typography": extract_typography(page),
                "fonts": extract_all_fonts(page),
                "spacing": extract_spacing(page),
                "borderRadius": extract_border_radius(page),
                "shadows": extract_shadows(page),
                "effects": extract_transitions_animations(page),
                "cssVariables": extract_css_variables(page),
                "layout": extract_layout_info(page),
                "interactiveStates": extract_interactive_states(page)
            }
            
            design_tokens["colors"]["categorized"] = categorize_colors(design_tokens["colors"]["raw"])
            
            json_path = output_dir / "design-tokens.json"
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(design_tokens, f, indent=2, ensure_ascii=False)
            print(f"Saved design tokens to: {json_path}")
            
            title = page.title()
            
            print(f"\n=== Design Tokens Summary ===")
            print(f"Page Title: {title}")
            print(f"Colors found: {len(design_tokens['colors']['raw'])}")
            print(f"Fonts found: {len(design_tokens['fonts'])}")
            print(f"Spacing values: {len(design_tokens['spacing'])}")
            print(f"Border radius values: {len(design_tokens['borderRadius'])}")
            print(f"CSS variables: {len(design_tokens['cssVariables'])}")
            print(f"Box shadows: {len(design_tokens['shadows']['boxShadows'])}")
            print(f"Transitions: {len(design_tokens['effects']['transitions'])}")
            print(f"Animations: {len(design_tokens['effects']['animations'])}")
            
        except Exception as e:
            print(f"Error extracting design tokens: {e}")
            sys.exit(1)
        finally:
            browser.close()
    
    print("\nDone!")


if __name__ == "__main__":
    main()

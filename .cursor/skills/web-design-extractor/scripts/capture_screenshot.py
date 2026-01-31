#!/usr/bin/env python3
"""
Capture screenshots of a webpage using Playwright.

Usage:
    python capture_screenshot.py <url> [--output <output_dir>] [--viewport <width>x<height>] [--full-page]

Examples:
    python capture_screenshot.py https://example.com
    python capture_screenshot.py https://example.com --output ./screenshots --full-page
    python capture_screenshot.py https://example.com --viewport 1600x1200 --full-page
"""

import argparse
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)


def sanitize_filename(url: str) -> str:
    """Create a safe filename from URL."""
    parsed = urlparse(url)
    name = parsed.netloc.replace(".", "_")
    path = parsed.path.strip("/").replace("/", "_")
    if path:
        name = f"{name}_{path}"
    return name[:100]


def capture_screenshots(url: str, output_dir: Path, viewport_width: int, viewport_height: int, 
                        full_page: bool = True, wait_time: int = 3000):
    """Capture viewport and full page screenshots."""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": viewport_width, "height": viewport_height},
            device_scale_factor=2
        )
        page = context.new_page()
        
        try:
            print(f"Loading: {url}")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(wait_time)
            
            base_name = sanitize_filename(url)
            
            viewport_path = output_dir / f"{base_name}_viewport.png"
            page.screenshot(path=str(viewport_path), full_page=False)
            print(f"Saved viewport screenshot: {viewport_path}")
            
            if full_page:
                fullpage_path = output_dir / f"{base_name}_fullpage.png"
                page.screenshot(path=str(fullpage_path), full_page=True)
                print(f"Saved full page screenshot: {fullpage_path}")
            
            dimensions = page.evaluate("""() => {
                return {
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    documentWidth: document.documentElement.scrollWidth,
                    documentHeight: document.documentElement.scrollHeight
                };
            }""")
            
            print(f"\n=== Page Dimensions ===")
            print(f"Viewport: {dimensions['viewportWidth']}x{dimensions['viewportHeight']}")
            print(f"Full page: {dimensions['documentWidth']}x{dimensions['documentHeight']}")
            
            return {
                "viewport_screenshot": str(viewport_path),
                "fullpage_screenshot": str(fullpage_path) if full_page else None,
                "dimensions": dimensions
            }
            
        except Exception as e:
            print(f"Error capturing screenshots: {e}")
            sys.exit(1)
        finally:
            browser.close()


def capture_hover_states(url: str, output_dir: Path, viewport_width: int, viewport_height: int,
                         wait_time: int = 1000):
    """Capture screenshots of elements in hover state."""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": viewport_width, "height": viewport_height},
            device_scale_factor=2
        )
        page = context.new_page()
        
        try:
            print(f"Loading: {url}")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(wait_time)
            
            base_name = sanitize_filename(url)
            hover_dir = output_dir / "hover_states"
            hover_dir.mkdir(exist_ok=True)
            
            interactive_selectors = [
                ("buttons", "button, [type='button'], [type='submit'], .btn, [class*='button']"),
                ("links", "a[href]"),
                ("cards", "[class*='card'], .card"),
            ]
            
            for name, selector in interactive_selectors:
                elements = page.locator(selector).all()
                print(f"Found {len(elements)} {name}")
                
                for i, element in enumerate(elements[:5]):
                    try:
                        element.scroll_into_view_if_needed()
                        page.wait_for_timeout(200)
                        
                        box = element.bounding_box()
                        if box:
                            normal_path = hover_dir / f"{base_name}_{name}_{i}_normal.png"
                            element.screenshot(path=str(normal_path))
                            
                            element.hover()
                            page.wait_for_timeout(300)
                            
                            hover_path = hover_dir / f"{base_name}_{name}_{i}_hover.png"
                            element.screenshot(path=str(hover_path))
                            
                            print(f"  Captured {name} {i}: normal + hover")
                    except Exception as e:
                        print(f"  Skipped {name} {i}: {e}")
            
            return hover_dir
            
        except Exception as e:
            print(f"Error capturing hover states: {e}")
            return None
        finally:
            browser.close()


def main():
    parser = argparse.ArgumentParser(description="Capture webpage screenshots")
    parser.add_argument("url", help="URL of the webpage to capture")
    parser.add_argument("--output", "-o", default="./output", help="Output directory")
    parser.add_argument("--viewport", "-v", default="1600x1200", help="Viewport size (WIDTHxHEIGHT)")
    parser.add_argument("--full-page", "-f", action="store_true", default=True, help="Capture full page screenshot")
    parser.add_argument("--hover-states", action="store_true", help="Capture hover state screenshots")
    parser.add_argument("--wait", "-w", type=int, default=3000, help="Wait time after load (ms)")
    
    args = parser.parse_args()
    
    viewport_parts = args.viewport.split("x")
    viewport_width = int(viewport_parts[0])
    viewport_height = int(viewport_parts[1])
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Capturing screenshots from: {args.url}")
    print(f"Viewport: {viewport_width}x{viewport_height}")
    print(f"Output directory: {output_dir}")
    print()
    
    result = capture_screenshots(
        args.url, 
        output_dir, 
        viewport_width, 
        viewport_height,
        args.full_page,
        args.wait
    )
    
    if args.hover_states:
        print("\n=== Capturing Hover States ===")
        capture_hover_states(args.url, output_dir, viewport_width, viewport_height)
    
    print("\nDone!")


if __name__ == "__main__":
    main()

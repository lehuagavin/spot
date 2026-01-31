#!/usr/bin/env python3
"""
Compare two webpage screenshots for visual similarity.

Usage:
    python compare_pages.py <original_image> <rebuilt_image> [--output <diff_output>] [--threshold <value>]

Examples:
    python compare_pages.py original.png rebuilt.png
    python compare_pages.py original.png rebuilt.png --output diff.png --threshold 0.95
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFilter
    import numpy as np
except ImportError:
    print("Error: Required packages not installed. Run: pip install pillow numpy")
    sys.exit(1)


def load_and_resize(img1_path: str, img2_path: str):
    """Load images and resize to match dimensions."""
    img1 = Image.open(img1_path).convert("RGB")
    img2 = Image.open(img2_path).convert("RGB")
    
    width = min(img1.width, img2.width)
    height = min(img1.height, img2.height)
    
    if img1.size != (width, height):
        img1 = img1.resize((width, height), Image.Resampling.LANCZOS)
    if img2.size != (width, height):
        img2 = img2.resize((width, height), Image.Resampling.LANCZOS)
    
    return img1, img2


def calculate_similarity(img1: Image.Image, img2: Image.Image) -> float:
    """Calculate pixel-level similarity between two images."""
    arr1 = np.array(img1, dtype=np.float32)
    arr2 = np.array(img2, dtype=np.float32)
    
    mse = np.mean((arr1 - arr2) ** 2)
    similarity = 1 - (mse / 65025)
    
    return similarity


def calculate_structural_similarity(img1: Image.Image, img2: Image.Image) -> float:
    """Calculate structural similarity (simplified SSIM)."""
    arr1 = np.array(img1.convert("L"), dtype=np.float32)
    arr2 = np.array(img2.convert("L"), dtype=np.float32)
    
    mean1 = np.mean(arr1)
    mean2 = np.mean(arr2)
    var1 = np.var(arr1)
    var2 = np.var(arr2)
    covar = np.mean((arr1 - mean1) * (arr2 - mean2))
    
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2
    
    ssim = ((2 * mean1 * mean2 + C1) * (2 * covar + C2)) / \
           ((mean1 ** 2 + mean2 ** 2 + C1) * (var1 + var2 + C2))
    
    return float(ssim)


def create_diff_image(img1: Image.Image, img2: Image.Image, output_path: str):
    """Create a visual diff image highlighting differences."""
    diff = ImageChops.difference(img1, img2)
    diff_enhanced = diff.point(lambda x: min(x * 5, 255))
    
    width = img1.width
    height = img1.height
    
    comparison = Image.new("RGB", (width * 3, height))
    comparison.paste(img1, (0, 0))
    comparison.paste(img2, (width, 0))
    comparison.paste(diff_enhanced, (width * 2, 0))
    
    try:
        from PIL import ImageFont
        font = ImageFont.load_default()
    except:
        font = None
    
    draw = ImageDraw.Draw(comparison)
    labels = ["Original", "Rebuilt", "Difference"]
    for i, label in enumerate(labels):
        draw.rectangle([(i * width, 0), (i * width + 100, 25)], fill="white")
        draw.text((i * width + 10, 5), label, fill="black", font=font)
    
    comparison.save(output_path)
    return output_path


def create_heatmap(img1: Image.Image, img2: Image.Image, output_path: str):
    """Create a heatmap showing where differences occur."""
    diff = ImageChops.difference(img1.convert("L"), img2.convert("L"))
    diff_smoothed = diff.filter(ImageFilter.GaussianBlur(radius=5))
    
    diff_array = np.array(diff_smoothed, dtype=np.float32)
    diff_normalized = diff_array / 255.0
    
    heatmap = np.zeros((*diff_array.shape, 3), dtype=np.uint8)
    heatmap[:, :, 2] = np.clip((1 - diff_normalized) * 255, 0, 255).astype(np.uint8)
    heatmap[:, :, 0] = np.clip(diff_normalized * 255, 0, 255).astype(np.uint8)
    heatmap[:, :, 1] = np.clip((1 - abs(diff_normalized - 0.5) * 2) * 128, 0, 255).astype(np.uint8)
    
    heatmap_img = Image.fromarray(heatmap)
    
    original_faded = Image.blend(img1.convert("RGB"), Image.new("RGB", img1.size, "white"), 0.5)
    result = Image.blend(original_faded, heatmap_img, 0.5)
    
    result.save(output_path)
    return output_path


def analyze_regions(img1: Image.Image, img2: Image.Image, grid_size: int = 10):
    """Analyze similarity by regions to identify problem areas."""
    width = img1.width
    height = img1.height
    cell_width = width // grid_size
    cell_height = height // grid_size
    
    regions = []
    
    for row in range(grid_size):
        for col in range(grid_size):
            left = col * cell_width
            top = row * cell_height
            right = min(left + cell_width, width)
            bottom = min(top + cell_height, height)
            
            region1 = img1.crop((left, top, right, bottom))
            region2 = img2.crop((left, top, right, bottom))
            
            similarity = calculate_similarity(region1, region2)
            
            regions.append({
                "row": row,
                "col": col,
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top,
                "similarity": similarity
            })
    
    return regions


def main():
    parser = argparse.ArgumentParser(description="Compare webpage screenshots")
    parser.add_argument("original", help="Path to original screenshot")
    parser.add_argument("rebuilt", help="Path to rebuilt page screenshot")
    parser.add_argument("--output", "-o", default="./comparison", help="Output directory for diff images")
    parser.add_argument("--threshold", "-t", type=float, default=0.95, help="Similarity threshold (0-1)")
    
    args = parser.parse_args()
    
    if not Path(args.original).exists():
        print(f"Error: Original image not found: {args.original}")
        sys.exit(1)
    if not Path(args.rebuilt).exists():
        print(f"Error: Rebuilt image not found: {args.rebuilt}")
        sys.exit(1)
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Comparing images:")
    print(f"  Original: {args.original}")
    print(f"  Rebuilt:  {args.rebuilt}")
    print()
    
    img1, img2 = load_and_resize(args.original, args.rebuilt)
    print(f"Image dimensions: {img1.width}x{img1.height}")
    
    pixel_similarity = calculate_similarity(img1, img2)
    structural_similarity = calculate_structural_similarity(img1, img2)
    
    print(f"\n=== Similarity Metrics ===")
    print(f"Pixel Similarity:      {pixel_similarity:.4f} ({pixel_similarity * 100:.2f}%)")
    print(f"Structural Similarity: {structural_similarity:.4f} ({structural_similarity * 100:.2f}%)")
    
    passed = pixel_similarity >= args.threshold
    status = "PASS" if passed else "FAIL"
    print(f"\nThreshold: {args.threshold:.2f}")
    print(f"Status: {status}")
    
    print(f"\n=== Generating Visual Comparisons ===")
    
    diff_path = output_dir / "comparison_diff.png"
    create_diff_image(img1, img2, str(diff_path))
    print(f"Saved comparison: {diff_path}")
    
    heatmap_path = output_dir / "comparison_heatmap.png"
    create_heatmap(img1, img2, str(heatmap_path))
    print(f"Saved heatmap: {heatmap_path}")
    
    print(f"\n=== Region Analysis ===")
    regions = analyze_regions(img1, img2)
    
    problem_regions = [r for r in regions if r["similarity"] < args.threshold]
    if problem_regions:
        print(f"Problem areas ({len(problem_regions)}):")
        for r in sorted(problem_regions, key=lambda x: x["similarity"])[:10]:
            print(f"  Region ({r['col']}, {r['row']}): {r['similarity']:.4f} - position ({r['x']}, {r['y']})")
    else:
        print("No significant problem areas detected!")
    
    print(f"\n=== Summary ===")
    print(f"Overall similarity: {pixel_similarity * 100:.2f}%")
    if passed:
        print("The rebuilt page is pixel-perfect within the threshold!")
    else:
        improvement_needed = (args.threshold - pixel_similarity) * 100
        print(f"The rebuilt page needs {improvement_needed:.2f}% more accuracy to reach the threshold.")
        print("Check the heatmap and region analysis for areas that need improvement.")
    
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()

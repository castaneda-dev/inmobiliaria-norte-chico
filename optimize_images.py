import os
from PIL import Image

def resize_and_convert(image_path, base_name, max_size, suffix):
    with Image.open(image_path) as img:
        # Calculate aspect ratio
        width, height = img.size
        
        # Don't upscale
        if width > max_size[0] or height > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to RGB (to avoid issues with alpha channel if any, though webp supports alpha)
        # WebP handles RGBA, so we can save directly or convert if needed
        output_name = f"{base_name}_{suffix}.webp"
        print(f"Saving {output_name} (Size: {img.size})")
        img.save(output_name, 'webp', quality=80)

def main():
    directory = '.'
    for filename in os.listdir(directory):
        if filename.endswith(".png") and filename.startswith("PR_"):
            print(f"Processing {filename}...")
            base_name = os.path.splitext(filename)[0]
            
            # Desktop: 1920x1080
            resize_and_convert(filename, base_name, (1920, 1080), "desktop")
            
            # Mobile: 800x600
            resize_and_convert(filename, base_name, (800, 600), "mobile")
            
            # Create a regular webp version too just in case it's used elsewhere
            # resize_and_convert(filename, base_name, (1920, 1080), "optimized")

if __name__ == "__main__":
    main()

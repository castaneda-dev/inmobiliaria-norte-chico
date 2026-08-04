import os
from PIL import Image

images = [
    'PR_CHANCAY_desktop.webp',
    'PR_ECOTRULY_PARK_desktop.webp',
    'PR_PLAZA_CHANCAY_desktop.webp',
    'PR_PLAZA_HUARAL_desktop.webp',
    'PR_GLORIETA_DELUXE.webp'
]

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

for img_name in images:
    filepath = os.path.join(root_dir, img_name)
    if os.path.exists(filepath):
        orig_size = os.path.getsize(filepath)
        with Image.open(filepath) as img:
            img = img.convert('RGB')
            max_w = 850
            if img.width > max_w:
                new_h = int((img.height * max_w) / img.width)
                img = img.resize((max_w, new_h), Image.Resampling.LANCZOS)
            img.save(filepath, 'WEBP', quality=82, method=6)
        new_size = os.path.getsize(filepath)
        savings = (1 - (new_size / orig_size)) * 100
        print(f"Optimized {img_name}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (-{savings:.1f}%)")

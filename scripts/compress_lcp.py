import os
from PIL import Image

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
filepath = os.path.join(root_dir, 'PR_PLAZA_HUARAL_desktop.webp')

if os.path.exists(filepath):
    orig_size = os.path.getsize(filepath)
    with Image.open(filepath) as img:
        img = img.convert('RGB')
        max_w = 800
        if img.width > max_w:
            new_h = int((img.height * max_w) / img.width)
            img = img.resize((max_w, new_h), Image.Resampling.LANCZOS)
        img.save(filepath, 'WEBP', quality=70, method=6)
    new_size = os.path.getsize(filepath)
    savings = (1 - (new_size / orig_size)) * 100
    print(f"Compressed PR_PLAZA_HUARAL_desktop.webp: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (-{savings:.1f}%)")

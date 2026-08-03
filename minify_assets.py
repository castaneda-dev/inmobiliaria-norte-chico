import os
from jsmin import jsmin
from csscompressor import compress

def minify_file(filepath, min_filepath, file_type):
    print(f"Minifying {filepath} to {min_filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if file_type == 'js':
        minified = jsmin(content)
    elif file_type == 'css':
        minified = compress(content)
    
    with open(min_filepath, 'w', encoding='utf-8') as f:
        f.write(minified)

def main():
    assets_dir = os.path.join('.', 'assets')
    js_dir = os.path.join(assets_dir, 'js')
    css_dir = os.path.join(assets_dir, 'css')
    
    # Minify JS
    js_files = ['api.js', 'index-app.js', 'app.js']
    for f in js_files:
        src = os.path.join(js_dir, f)
        if os.path.exists(src):
            dst = os.path.join(js_dir, f.replace('.js', '.min.js'))
            minify_file(src, dst, 'js')
            
    # Minify CSS
    css_files = ['index.css', 'admin.css']
    for f in css_files:
        src = os.path.join(css_dir, f)
        if os.path.exists(src):
            dst = os.path.join(css_dir, f.replace('.css', '.min.css'))
            minify_file(src, dst, 'css')
            
    print("Minification complete.")

if __name__ == "__main__":
    main()

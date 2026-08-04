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

def bundle_and_minify_app(js_dir, modules_dir, dst_path):
    print("Bundling and minifying app modules into app.min.js...")
    modules = [
        'toast.module.js',
        'auth.module.js',
        'router.module.js',
        'renderers.module.js',
        'modals.module.js'
    ]
    bundled_content = ""
    for mod in modules:
        mod_path = os.path.join(modules_dir, mod)
        if os.path.exists(mod_path):
            with open(mod_path, 'r', encoding='utf-8') as f:
                bundled_content += f"\n/* --- {mod} --- */\n" + f.read() + "\n"
    
    app_path = os.path.join(js_dir, 'app.js')
    if os.path.exists(app_path):
        with open(app_path, 'r', encoding='utf-8') as f:
            bundled_content += "\n/* --- app.js --- */\n" + f.read() + "\n"

    minified = jsmin(bundled_content)
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(minified)

def main():
    assets_dir = os.path.join('.', 'assets')
    js_dir = os.path.join(assets_dir, 'js')
    css_dir = os.path.join(assets_dir, 'css')
    modules_dir = os.path.join(js_dir, 'modules')
    
    # Minify JS individual files
    js_files = ['api.js', 'index-app.js']
    for f in js_files:
        src = os.path.join(js_dir, f)
        if os.path.exists(src):
            dst = os.path.join(js_dir, f.replace('.js', '.min.js'))
            minify_file(src, dst, 'js')

    # Bundle modules & app.js into app.min.js
    app_min_dst = os.path.join(js_dir, 'app.min.js')
    bundle_and_minify_app(js_dir, modules_dir, app_min_dst)
            
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

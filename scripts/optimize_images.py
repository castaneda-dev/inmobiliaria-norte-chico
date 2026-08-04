import os
import sys
from PIL import Image

"""
====================================================================
ESTRATEGIA DE RENDERIZADO Y OPTIMIZACIÓN DE IMÁGENES - NORTE CHICO
====================================================================
Este script escanea la carpeta IMAGENES_PROD y convierte cualquier
imagen pesada (PNG, JPG, JFIF) en formatos WebP de Alta Definición HD.

PRESETS DISPONIBLES:
1. 'hero': Para carruseles principales y fondos de portada (1920px max, 88% calidad).
2. 'catalog': Para propiedades del catálogo y modales (1200px max, 85% calidad).
3. 'mobile': Para versiones ultra-ligeras de celular (800px max, 80% calidad).

USO:
   python scripts/optimize_images.py
====================================================================
"""

PRESETS = {
    'hero': {'max_w': 1920, 'quality': 88},
    'catalog': {'max_w': 1200, 'quality': 85},
    'mobile': {'max_w': 800, 'quality': 80}
}

# Mapeo automático de nombres del carrusel de inicio
CARRUSEL_MAPPING = {
    'OFICIAL_PLAZA_HUARAL.png': 'PR_PLAZA_HUARAL_desktop.webp',
    'OFICIAL_PLAZA_CHANCAY.png': 'PR_PLAZA_CHANCAY_desktop.webp',
    'OFICIAL_ECOTRULY_PARK.png': 'PR_ECOTRULY_PARK_desktop.webp',
    'OFICIAL_CHANCAY.png': 'PR_CHANCAY_desktop.webp',
    'PR_GLORIETA_DELUXE.png': 'PR_GLORIETA_DELUXE.webp'
}

def process_image(src_path, dst_path, preset='hero'):
    config = PRESETS.get(preset, PRESETS['hero'])
    max_w = config['max_w']
    quality = config['quality']

    original_bytes = os.path.getsize(src_path)

    with Image.open(src_path) as img:
        # Convertir modos no-RGB (RGBA, P, LA)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')

        # Redimensionar solo si supera el ancho máximo (LANCZOS para mantener contraste y enfoque)
        if img.width > max_w:
            new_h = int((img.height * max_w) / img.width)
            img = img.resize((max_w, new_h), Image.Resampling.LANCZOS)

        # Guardar en formato WebP optimizado
        img.save(dst_path, 'WEBP', quality=quality, method=6)

    new_bytes = os.path.getsize(dst_path)
    savings = (1 - (new_bytes / original_bytes)) * 100
    print(f"  ✅ {os.path.basename(src_path)} -> {os.path.basename(dst_path)}")
    print(f"     Peso: {original_bytes/1024:.1f} KB -> {new_bytes/1024:.1f} KB (-{savings:.1f}% ahorro)\n")

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    prod_dir = os.path.join(root_dir, 'IMAGENES_PROD')

    print("🖼️  =======================================================")
    print("   PROCESADOR AUTOMÁTICO DE IMÁGENES HD - NORTE CHICO")
    print("   =======================================================\n")

    if not os.path.exists(prod_dir):
        print(f"⚠️  La carpeta {prod_dir} no existe. Créala y coloca allí tus imágenes.")
        return

    count = 0

    # 1. Procesar carrusel oficial
    carrusel_dir = os.path.join(prod_dir, 'CARRUSEL_INICIO')
    if os.path.exists(carrusel_dir):
        print("📸 Procesando imágenes oficiales del Carrusel Principal...")
        for filename in os.listdir(carrusel_dir):
            if filename in CARRUSEL_MAPPING:
                src_path = os.path.join(carrusel_dir, filename)
                dst_path = os.path.join(root_dir, CARRUSEL_MAPPING[filename])
                process_image(src_path, dst_path, preset='hero')
                count += 1

    # 2. Procesar imágenes generales en IMAGENES_PROD
    for root, _, files in os.walk(prod_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ('.png', '.jpg', '.jpeg', '.jfif') and file not in CARRUSEL_MAPPING:
                src_path = os.path.join(root, file)
                base_name = os.path.splitext(file)[0]
                dst_path = os.path.join(root_dir, f"{base_name}.webp")
                process_image(src_path, dst_path, preset='catalog')
                count += 1

    print("✨ =======================================================")
    print(f"   ¡Proceso completado! Se optimizaron {count} imágenes.")
    print("   =======================================================\n")

if __name__ == "__main__":
    main()

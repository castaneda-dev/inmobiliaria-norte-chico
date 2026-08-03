/**
 * compress_images.js — Fase 1: Optimización de Imágenes
 * Usa sharp (libvips) para recomprimir WebP sin pérdida visual perceptible.
 * Objetivo: ≤ 80 KB por imagen de escritorio.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

const targets = [
    // [archivo, ancho_max, calidad]
    ['PR_PLAZA_HUARAL_desktop.webp',   1440, 70],
    ['PR_PLAZA_CHANCAY_desktop.webp',  1440, 70],
    ['PR_ECOTRULY_PARK_desktop.webp',  1440, 70],
    ['PR_CHANCAY_desktop.webp',        1440, 70],
    ['PR_GLORIETA_DELUXE_desktop.webp',1440, 70],
    ['PR_PLAZA_HUARAL_mobile.webp',     600, 65],
    ['PR_PLAZA_CHANCAY_mobile.webp',    600, 65],
    ['PR_ECOTRULY_PARK_mobile.webp',    600, 65],
    ['PR_CHANCAY_mobile.webp',          600, 65],
    ['PR_GLORIETA_DELUXE_mobile.webp',  600, 65],
];

async function compress() {
    console.log('🖼️  Iniciando compresión de imágenes con sharp...\n');
    let totalBefore = 0, totalAfter = 0;

    for (const [filename, width, quality] of targets) {
        const filePath = path.join(ROOT, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Omitido (no existe): ${filename}`);
            continue;
        }

        const beforeSize = fs.statSync(filePath).size;
        totalBefore += beforeSize;

        // Convertir directamente a buffer en memoria
        const buffer = await sharp(filePath)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality, effort: 6, smartSubsample: true })
            .toBuffer();

        const afterSize = buffer.length;
        totalAfter += afterSize;

        if (afterSize < beforeSize) {
            // Escribir buffer directamente (evita el problema de rename/copy en OneDrive)
            fs.writeFileSync(filePath, buffer);
            const saved = Math.round((1 - afterSize / beforeSize) * 100);
            console.log(`✅ ${filename}`);
            console.log(`   ${Math.round(beforeSize/1024)} KB  →  ${Math.round(afterSize/1024)} KB  (-${saved}%)\n`);
        } else {
            totalAfter = totalAfter - afterSize + beforeSize; // Corregir total
            console.log(`ℹ️  ${filename} ya estaba optimizado, sin cambios.\n`);
        }
    }

    console.log('─────────────────────────────────────────────');
    console.log(`📦 Total antes:   ${Math.round(totalBefore/1024)} KB`);
    console.log(`📦 Total después: ${Math.round(totalAfter/1024)} KB`);
    console.log(`💾 Ahorro total:  ${Math.round((1 - totalAfter/totalBefore) * 100)}%`);
    console.log('─────────────────────────────────────────────');
}

compress().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });

/**
 * obfuscate.js — Fase 2: Ofuscación Nivel B
 * Usa javascript-obfuscator para convertir el JS de la Landing pública en
 * código prácticamente incomprensible, sin afectar la funcionalidad.
 *
 * IMPORTANTE: Solo se ofusca el JS de la Landing (index.html).
 * El Admin Dashboard NO se ofusca (protegido por login de Supabase).
 */
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const JS_DIR = path.join(ROOT, 'assets', 'js');

// Archivos a ofuscar (solo los de la landing pública)
const targets = [
    { input: 'supabase_config.js', output: 'supabase_config.obf.js' },
    { input: 'api.js',        output: 'api.obf.js' },
    { input: 'index-app.js',  output: 'index-app.obf.js' },
];

// Configuración Nivel A: Máxima Seguridad Militar
const OBFUSCATOR_CONFIG = {
    compact: true,
    controlFlowFlattening: true,          // Mezcla el flujo del programa
    controlFlowFlatteningThreshold: 1.0,  // 100% del código afectado (Máxima seguridad)
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    splitStringsChunkLength: 3,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64', 'rc4'], // Doble codificación de textos
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayThreshold: 1.0,           // 100% de strings ofuscados
    unicodeEscapeSequence: true,         // Oculta completamente caracteres reconocibles
    deadCodeInjection: true,             // Inyecta código falso para despistar
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,               // Congela el navegador si abren F12 (DevTools)
    debugProtectionInterval: 2000,
    selfDefending: true,                 // Autodestruye el código si intentan formatearlo (beautify)
    identifierNamesGenerator: 'hexadecimal', 
    renameGlobals: false,                 // NO renombrar globals (rompe window.api, window.supabaseClient)
};

async function obfuscate() {
    console.log('🔒 Iniciando ofuscación Nivel B...\n');

    for (const { input, output } of targets) {
        // Determinar la ruta: si es supabase_config, está en ROOT, si no, en JS_DIR
        const isRootFile = input === 'supabase_config.js';
        const inputPath  = isRootFile ? path.join(ROOT, input) : path.join(JS_DIR, input);
        const outputPath = isRootFile ? path.join(ROOT, output) : path.join(JS_DIR, output);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Omitido (no existe): ${inputPath}`);
            continue;
        }

        const source = fs.readFileSync(inputPath, 'utf8');
        const before = source.length;

        const result = JavaScriptObfuscator.obfuscate(source, OBFUSCATOR_CONFIG);
        const obfuscated = result.getObfuscatedCode();
        const after = obfuscated.length;

        fs.writeFileSync(outputPath, obfuscated, 'utf8');

        const ratio = Math.round(after / before * 100);
        console.log(`✅ ${input} → ${output}`);
        console.log(`   ${Math.round(before/1024)} KB → ${Math.round(after/1024)} KB (${ratio}% del original)\n`);
    }

    console.log('─────────────────────────────────────────────');
    console.log('✅ Ofuscación completada. Archivos generados:');
    targets.forEach(({ output }) => console.log('   assets/js/' + output));
    console.log('─────────────────────────────────────────────');
    console.log('\n⚠️  Recuerda actualizar index.html para usar los .obf.js');
}

obfuscate().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });

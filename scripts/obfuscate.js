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
    { input: 'api.min.js',        output: 'api.obf.js' },
    { input: 'index-app.min.js',  output: 'index-app.obf.js' },
];

// Configuración Nivel B: Máxima ofuscación manteniendo compatibilidad
const OBFUSCATOR_CONFIG = {
    compact: true,
    controlFlowFlattening: true,          // Mezcla el flujo del programa en un switch gigante
    controlFlowFlatteningThreshold: 0.5,  // 50% del código afectado (balance rendimiento/seguridad)
    numbersToExpressions: true,            // 42 → (0x2a | 0)
    simplify: true,
    stringArrayShuffle: true,             // Baraja el array de strings
    splitStrings: true,                   // 'hola' → 'ho' + 'la'
    splitStringsChunkLength: 5,
    stringArray: true,                    // Convierte todos los strings a referencias de array
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],      // Codifica strings en base64
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayThreshold: 0.75,           // 75% de strings ofuscados
    unicodeEscapeSequence: false,         // Evitar unicodes que inflan el tamaño
    deadCodeInjection: false,             // Desactivado: infla el archivo mucho
    debugProtection: false,               // Desactivado: puede romper DevTools en desarrollo
    selfDefending: false,                 // Desactivado: puede crear bucles infinitos
    identifierNamesGenerator: 'hexadecimal', // Variables: _0x1a2b, _0xc3d4
    renameGlobals: false,                 // NO renombrar globals (rompe window.api, etc.)
};

async function obfuscate() {
    console.log('🔒 Iniciando ofuscación Nivel B...\n');

    for (const { input, output } of targets) {
        const inputPath  = path.join(JS_DIR, input);
        const outputPath = path.join(JS_DIR, output);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Omitido (no existe): ${input}`);
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

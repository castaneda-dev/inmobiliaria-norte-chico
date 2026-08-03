# Inmobiliaria Norte Chico — Ecosistema Unificado SaaS

Plataforma inmobiliaria integral para la gestión de lotes residenciales, departamentos y terrenos con CRM de prospectos en tiempo real.

## 🚀 Arquitectura
- **Landing Page Pública**: `BORRADOR.HTML` (ó `index.html`)
- **Dashboard de Control CRM**: `admin_dashboard.html`
- **Base de Datos & Autenticación**: Supabase Cloud PostgreSQL
- **Despliegue Continuo**: Vercel con Dominio `banka.cl`

---

## 📜 Reglas de Negocio y Consideraciones del Sistema

Para garantizar la estabilidad del sistema durante futuras implementaciones y mejoras, todo el equipo de desarrollo debe adherirse a las siguientes reglas (derivadas de incidentes pasados):

### 1. Minificación de JavaScript (Compatibilidad de Sintaxis)
- **Regla:** Queda **prohibido** utilizar minificadores obsoletos (como `jsmin` en Python) para comprimir el código del frontend.
- **Motivo:** Nuestro código utiliza características modernas de JavaScript (ES2020+), como el *Optional Chaining* (`?.`). Los minificadores antiguos no reconocen esta sintaxis, truncan el archivo y provocan un colapso total (Syntax Error), impidiendo la conexión con Supabase y deshabilitando componentes interactivos.
- **Alternativa:** Si se requiere minificar para producción, se debe utilizar un *bundler* moderno (Vite, Webpack, Esbuild) o herramientas actualizadas (Terser). Si no están disponibles, es preferible mantener el archivo original `.js`.

### 2. Carruseles y Atributos Responsive (Imágenes)
- **Regla:** En estructuras tipo carrusel que dependan de Flexbox (`display: flex`) y traducciones de posición (`transform: translateX`), las imágenes deben usar el atributo `src` directo.
- **Motivo:** El uso de atributos dinámicos como `srcset` y `sizes="(max-width: 800px) 100vw..."`, o la envoltura en etiquetas `<picture>`, entra en conflicto con las reglas CSS estrictas de contenedores flex `min-width: 100%`. Esto causa que el motor de renderizado de ciertos navegadores colapse el ancho de las imágenes subsiguientes, provocando que el carrusel se quede pegado mostrando un espacio en blanco o una sola foto.
- **Alternativa:** Generar las imágenes WebP con un tamaño optimizado (ej. max 1920x1080) y pasarlas directamente en el atributo `src`. El ahorro de peso se logrará por el formato y resolución sin comprometer el renderizado de la estructura CSS del carrusel.

### 3. Loading = Lazy en Elementos Ocultos Horizontalmente
- **Regla:** **No** aplicar `loading="lazy"` nativo a las imágenes de un carrusel o slider de fotos.
- **Motivo:** Los navegadores a menudo no logran calcular correctamente la intersección (visibilidad) de elementos que están desplazados horizontalmente fuera de la pantalla mediante transformaciones (translates). Esto ocasiona que las imágenes nunca se descarguen, mostrando espacios vacíos al deslizar el carrusel.

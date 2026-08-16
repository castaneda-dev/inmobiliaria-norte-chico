# Inmobiliaria Norte Chico — Ecosistema Unificado SaaS

Plataforma inmobiliaria integral para la gestión de lotes residenciales, departamentos y terrenos con CRM de prospectos en tiempo real.

## 🚀 Arquitectura
- **Landing Page Pública**: `/` (`src/app/page.jsx`)
- **Blog Inmobiliario & Noticias**: `/blog` (`src/app/blog/page.jsx`)
- **Preguntas Frecuentes**: `/preguntas-frecuentes` (`src/app/preguntas-frecuentes/page.jsx`)
- **Dashboard de Control CRM**: `/crm` o `/admin` (`src/app/crm/page.jsx` / `AdminDashboardView.jsx`)
- **Base de Datos & Autenticación**: Supabase Cloud PostgreSQL (Tablas: `propiedades`, `clientes`, `articulos` con RLS estricto)
- **Seguridad 3FA**: Whitelist IP (`CRM_ALLOWED_IPS`), Supabase Auth y Google Authenticator TOTP (`CRM_TOTP_SECRET`)
- **Asistente Telegram Serverless**: `src/app/api/telegram_webhook/route.js` (@InmoPeru_bot)
- **Despliegue Continuo**: Vercel con Dominio `inmobiliarianortechico.pe`

## 🔑 Variables de Entorno (Vercel & `.env.local`)

Las siguientes variables deben estar configuradas en **Vercel > Settings > Environment Variables**:

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (obtenido vía @BotFather) |
| `TELEGRAM_CHAT_ID` | ID numérico del chat de Telegram donde se reciben alertas |
| `TELEGRAM_WEBHOOK_SECRET` | Token secreto para autenticar el webhook de Telegram |
| `CRM_TOTP_SECRET` | Clave secreta RFC 6238 para Google Authenticator 2FA |
| `CRM_ALLOWED_IPS` | Lista blanca de IPs autorizadas para acceder al CRM (ej. Wi-Fi Casa/Oficina) |

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

### 4. Credenciales y Variables de Entorno (Seguridad)
- **Regla:** Las credenciales sensibles (tokens de Telegram, claves de servicio de Supabase, API keys) **nunca** deben escribirse directamente en el código fuente que se despliega al navegador.
- **Motivo:** Cualquier persona puede inspeccionar el código fuente de una página web desde el navegador. Las claves expuestas pueden ser utilizadas por terceros malintencionados.
- **Alternativa:** Utilizar las **Variables de Entorno** del proveedor de hosting (Vercel, en nuestro caso). El archivo `api/webhook.js` accede a las credenciales via `process.env.NOMBRE_VARIABLE`, las cuales son inyectadas de forma segura por el servidor y **nunca** llegan al navegador del usuario. La clave `SUPABASE_ANON_KEY` del frontend es la excepción aceptable, ya que Supabase la diseña para ser pública (protegida por Row Level Security).
- **Control Adicional (Actualizado):** Se ha habilitado de forma estricta el Row Level Security (RLS) en Supabase para las tablas `clientes` y `propiedades`. Esto garantiza que la exposición de la llave pública `SUPABASE_ANON_KEY` no pueda ser utilizada para la extracción (Data Scraping) o alteración masiva de datos por usuarios no autenticados, blindando el ecosistema.

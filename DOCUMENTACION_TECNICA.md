# 📘 Manual Técnico, Arquitectura y Guía de Seguridad — Norte Chico

Este documento contiene la especificación técnica completa del proyecto **Inmobiliaria Norte Chico**, detallando la arquitectura de archivos, el funcionamiento módulo por módulo, las estrategias de rendimiento implementadas y todas las capas de ciberseguridad aplicadas.

---

## 📑 Tabla de Contenidos
1. [Estructura del Proyecto y Propósito de Módulos](#1-estructura-del-proyecto-y-propósito-de-módulos)
2. [Arquitectura Frontend & Dashboard Admin](#2-arquitectura-frontend--dashboard-admin)
3. [Capa de Datos y Conexión con Supabase](#3-capa-de-datos-y-conexión-con-supabase)
4. [Backend Serverless: Webhook CRM & Telegram](#4-backend-serverless-webhook-crm--telegram)
5. [Estrategias de Rendimiento y Caché](#5-estrategias-de-rendimiento-y-caché)
6. [Estrategias de Ciberseguridad Implementadas](#6-estrategias-de-ciberseguridad-implementadas)
7. [Guía de Compilación, Minificación y Ofuscación](#7-guía-de-compilación-minificación-y-ofuscación)
8. [Guía de Mantenimiento y Futuras Mejoras](#8-guía-de-mantenimiento-y-futuras-mejoras)

---

## 1. Estructura del Proyecto y Propósito de Módulos

```
PRUEBAS WEB/
├── index.html                  # Landing Page Pública de Venta de Inmuebles
├── dashboard_admin.html        # Panel de Administración Privado (CRM, Inventario, Agentes)
├── supabase_config.js          # Configuración e Inicialización Global del Cliente Supabase
├── inmobiliaria_crm.sql        # Esquema de Base de Datos y Políticas RLS en Supabase
├── vercel.json                 # Configuración de Despliegue y Cabeceras HTTP de Seguridad
├── package.json                # Dependencias Node.js (Supabase SDK, Obfuscator, Sharp)
├── minify_assets.py            # Script Python para Minificación de CSS y JS
├── optimize_images.py          # Script Python para Compresión y WebP de Imágenes
│
├── api/
│   └── webhook.js              # Serverless Function en Vercel para Webhooks (FB/TikTok Ads -> Supabase & Telegram)
│
├── assets/
│   ├── css/
│   │   ├── index.css           # Estilos CSS Vanilla de la Landing Page
│   │   ├── index.min.css       # Versión Minificada de index.css
│   │   ├── admin.css           # Estilos CSS Vanilla del Admin Dashboard (Tema Dark Gold)
│   │   └── admin.min.css       # Versión Minificada de admin.css
│   │
│   └── js/
│       ├── api.js              # Capa Data Access Object (DAO) para CRUD en Supabase
│       ├── api.min.js          # Versión Minificada de api.js
│       ├── api.obf.js          # Versión Ofuscada (Nivel B) para la Landing pública
│       ├── index-app.js        # Lógica Interactiva de la Landing Page
│       ├── index-app.min.js    # Versión Minificada de index-app.js
│       ├── index-app.obf.js    # Versión Ofuscada (Nivel B) de la Landing Page
│       ├── app.js              # Controlador Principal del Admin Dashboard (Auth, State, Renderers)
│       └── app.min.js          # Versión Minificada de app.js
│
└── scripts/
    ├── compress_images.js      # Script auxiliar Node.js para optimización de assets visuales
    └── obfuscate.js            # Script Node.js de Ofuscación Nivel B (`javascript-obfuscator`)
```

---

## 2. Arquitectura Frontend & Dashboard Admin

### 📄 `dashboard_admin.html`
- **Propósito**: Estructura principal del panel de administración.
- **Componentes clave**:
  - `<div id="appShell">`: Contenedor principal que agrupa el Sidebar y el contenido. Se inicializa con `display: none` para evitar el destello de contenido no autorizado antes de la autenticación.
  - `modalAuth`: Modal modalizado de inicio de sesión con feedback de error en tiempo real (`#authErrorMsg`).
  - `inactivityWarning`: Banner superior que advierte al usuario 1 minuto antes del cierre automático de sesión.
  - Secciones dinámicas: `#view-dashboard` (KPIs y Gráficos), `#view-inventario` (Propiedades), `#view-crm` (Leads), `#view-agentes` (Staff).

### ⚙️ `assets/js/app.js`
Es el **núcleo lógico del Dashboard**. Se divide en 5 grandes responsabilidades:

1. **Gestor Centralizado de Estado de Autenticación (`updateAuthStateUI`)**:
   - Muestra u oculta `#appShell` y `#modalAuth` de forma segura.
   - Forzada la propiedad CSS `display: flex !important` al autenticar.
2. **Auth Guard & Sesión (`checkSupabaseSession` & `handleSupabaseLogin`)**:
   - Valida la sesión con Supabase Auth.
   - Aplica **Rate Limiting** (máximo 5 intentos fallidos consecutivos con bloqueo de 2 minutos).
   - Registra listeners en tiempo real (`onAuthStateChange`) para detectar cierres de sesión desde otras pestañas.
3. **Navegación de Módulos (`switchView`)**:
   - Aplica **UI Optimista**: cambia la pestaña visualmente de forma inmediata (en menos de 50ms).
   - Realiza la descarga de datos en segundo plano usando `Promise.all()`.
4. **Renderizadores UI (`renderDashboard`, `renderProperties`, `renderClients`, `renderAgents`)**:
   - Construyen dinámicamente las tablas, gráficos SVG y tarjetas.
   - Aplican sanitización `escapeHTML()` a todos los campos provistos por la base de datos para evitar ataques XSS.
5. **Temporizador de Inactividad (10 Minutos)**:
   - Inicia contadores con eventos de mouse y teclado debounced.
   - A los 9 minutos despliega el banner `.inactivity-banner`.
   - A los 10 minutos invoca `supabaseClient.auth.signOut()` y regresa al login.

---

## 3. Capa de Datos y Conexión con Supabase

### 🔑 `supabase_config.js`
- **Propósito**: Conecta la aplicación cliente con el servicio de Supabase mediante `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
- **Garantía de Alcance Global**: Expone explícitamente `window.supabaseClient` en el objeto global del navegador, evitando problemas de scope producidos por la declaración `let`.

### 🗄️ `assets/js/api.js`
Capa Data Access Object (DAO) que encapsula todas las peticiones a Supabase:
- `fetchProperties()`, `saveProperty()`, `deleteProperty()`: Operaciones en la tabla `propiedades`.
- `fetchClients()`, `saveClient()`, `deleteClient()`: Operaciones en la tabla `clientes`.
- `fetchAgents()`, `saveAgent()`, `deleteAgent()`: Operaciones en la tabla `agentes`.
- `fetchInteractions()`, `saveInteraction()`: Operaciones en la tabla `interacciones`.

### 🛡️ `inmobiliaria_crm.sql` (Políticas Row Level Security - RLS)
Para evitar que cualquier usuario lea o borre información mediante la anon key pública, las tablas cuentan con RLS habilitado en Supabase:

```sql
-- Habilitar RLS
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para usuarios autenticados (Dashboard)
CREATE POLICY "Permitir todo a usuarios autenticados" ON propiedades FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON agentes FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON interacciones FOR ALL TO authenticated USING (true);

-- Permitir captura pública de leads en la Landing / Webhook
CREATE POLICY "Permitir insercion publica de leads" ON clientes FOR INSERT TO anon WITH CHECK (true);
```

---

## 4. Backend Serverless: Webhook CRM & Telegram

### ⚡ `api/webhook.js`
- **Propósito**: Endpoint HTTP POST desplegado como Serverless Function en Vercel.
- **Funcionamiento**:
  1. Recibe webhooks desde **Facebook Lead Ads**, **TikTok Ads** o formularios JSON genéricos.
  2. Parsea los campos de contacto (nombre, teléfono, email, origen, interés).
  3. Inserta el nuevo lead en la tabla `clientes` de Supabase con estado `'Nuevo'`.
  4. Envía una notificación instantánea a un grupo o chat de **Telegram** vía `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en formato Markdown.

---

## 5. Estrategias de Rendimiento y Caché

### 🚀 1. Navegación Optimista (UI Instantánea)
Al cambiar de sección en el Dashboard (`switchView('inventario')`), la interfaz oculta los paneles anteriores y activa el panel deseado **antes** de que termine la consulta de red. El usuario percibe una navegación instantánea de 0 milisegundos.

### ⚡ 2. Consultas en Paralelo (`Promise.all`)
Anteriormente las consultas a la base de datos se hacían secuenciales (`await fetch1()`, `await fetch2()`), sumando latencias de 2 a 3 segundos. Ahora se ejecutan en paralelo:

```javascript
const [props, clients, interactions] = await Promise.all([
    cachedFetch('properties', () => api.fetchProperties()),
    cachedFetch('clients', () => api.fetchClients()),
    cachedFetch('interactions', () => api.fetchInteractions())
]);
```

### 💾 3. Sistema de Caché Temporal en Memoria (TTL 30 Segundos)
- Evita descargas redundantes si el usuario cambia de pestaña de forma constante.
- Si los datos en memoria tienen menos de 30 segundos (`DATA_CACHE_TTL = 30000`), se retornan inmediatamente sin tocar la red.
- **Invalidación Inteligente**: Al realizar operaciones de escritura (crear, editar o eliminar registros), la función `invalidateCache()` expira el caché de forma automática.

---

## 6. Estrategias de Ciberseguridad Implementadas

| Capa | Mecanismo | Descripción |
|---|---|---|
| **Auth Guard** | Aislamiento DOM con `#appShell` | La interfaz del Dashboard no se renderiza hasta validar el JWT token en Supabase. |
| **Sesiones** | Timeout de 10 Minutos por Inactividad | Eventos de interacción reinician un contador de 10m. Muestra aviso al minuto 9 y destruye la sesión al minuto 10. |
| **XSS** | Sanitización con `escapeHTML()` | Todos los textos inyectados dinámicamente en el DOM son sanitizados para evitar la ejecución de código script malicioso. |
| **Fuerza Bruta** | Rate-Limiting en Login | Permite máximo 5 intentos fallidos consecutivos. Al superarlo, bloquea la autenticación por 2 minutos. |
| **Base de Datos** | Row Level Security (RLS) en Supabase | Restringe las lecturas y escrituras en la BD únicamente a tokens autenticados (`authenticated`). |
| **Headers HTTP** | `vercel.json` | Incluye `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`. |
| **Protección JS** | Ofuscación Nivel B + Minificación | Transforma el JS público de la Landing en código incomprensible (base64, hex identifiers, control flow flattening). |

---

## 7. Guía de Compilación, Minificación y Ofuscación

### 🐍 Minificación de Assets (`minify_assets.py`)
Comprime los archivos CSS y JS en versiones `.min.css` y `.min.js`:

```bash
python minify_assets.py
```

### 🔒 Ofuscación Nivel B (`scripts/obfuscate.js`)
Usa `javascript-obfuscator` para proteger el JS público de la Landing Page (`api.min.js` -> `api.obf.js`, `index-app.min.js` -> `index-app.obf.js`):

```bash
node scripts/obfuscate.js
```

---

## 8. Guía de Mantenimiento y Futuras Mejoras

### ➕ ¿Cómo agregar un nuevo módulo al Admin Dashboard?

1. **En `admin_dashboard.html`**:
   - Agrega un nuevo ítem en la lista `<ul class="nav-menu">` con su respectivo evento `onclick="switchView('nuevo_modulo', this)"`.
   - Crea la sección `<section id="view-nuevo_modulo" class="view-section">` con su HTML correspondiente.

2. **En `assets/js/app.js`**:
   - Agrega la vista en los títulos de cabecera de `switchView`: `nuevo_modulo: 'Título de la Sección'`.
   - En la sección de fetch en paralelo de `switchView`, agrega la llamada a las tablas que requiera la vista.
   - Crea la función renderizadora `renderNuevoModulo()` aplicando sanitización `escapeHTML()`.

3. **Compilar y Desplegar**:
   - Ejecuta `python minify_assets.py`.
   - Haz commit y push a Git:
     ```bash
     git add .
     git commit -m "Agregar nuevo modulo"
     git push origin main
     ```

---

## 9. Estrategia de Procesamiento y Renderizado de Imágenes HD

Para garantizar la máxima nitidez visual en pantallas 4K, Retina y móviles sin comprometer la velocidad de carga ni gastar ancho de banda excesivo, se ha implementado la siguiente estrategia estandarizada:

### 📐 1. Presets de Resolución y Compresión
- **Hero Carousel (`1920px max`, WebP 88% calidad)**: Destinado a imágenes de fondo de la cabecera y fotos principales del carrusel inicial.
- **Catálogo / Modales (`1200px max`, WebP 85% calidad)**: Destinado a las propiedades del inventario y galerías en ventanas emergentes.
- **Versión Móvil (`800px max`, WebP 80% calidad)**: Para optimizaciones ultra-ligeras en redes móviles 3G/4G.

### ⚡ 2. Automatización con `scripts/optimize_images.py`
Cada vez que se requiera actualizar imágenes de producción:
1. Coloca las imágenes originales (PNG, JPG, JFIF) dentro de la carpeta `IMAGENES_PROD/` (o `IMAGENES_PROD/CARRUSEL_INICIO/`).
2. Ejecuta el script automatizado:
   ```bash
   python scripts/optimize_images.py
   ```
3. El script convertirá las imágenes automáticamente a WebP de alta definición, reduciendo el peso entre un **90% y 95%** manteniendo nitidez HD con muestreo Lanczos.

### 🎨 3. Renderizado CSS por Hardware
Todas las imágenes de las tarjetas de propiedades, el carrusel hero y los modales cuentan con la regla CSS:
```css
image-rendering: -webkit-optimize-contrast;
object-fit: cover;
```
Esto fuerza a los navegadores (Safari, Chrome, Edge) a aplicar algoritmos de enfoque por hardware en la tarjeta gráfica del dispositivo, eliminando bordes borrosos en celulares y monitores Retina.

---

*Documentación técnica actualizada para la plataforma Inmobiliaria Norte Chico.*

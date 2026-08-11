<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Kit de Agentes, Roles con Memoria & Reglas de Negocio — Norte Chico

> **Entorno:** Producción (`PRODUCCION WEB INMOBILIARIA`)  
> **Dominio:** `inmobiliarianortechico.pe` | **Repositorio:** `castaneda-dev/inmobiliaria-norte-chico`

---

## 📌 1. Ficha del Negocio & Reglas de Oro

1. **Giro del Negocio:** Comercialización y gestión de ventas de lotes residenciales y terrenos de alta plusvalía en Chancay y Huaral (Perú), impulsados por el Mega Puerto Multipropósito de Chancay.
2. **Propuesta de Valor:** Terrenos residenciales con 100% de saneamiento legal e inscripción en SUNARP.
3. **Voz de Marca:** Visionaria, Técnica, Confiable, Profesional, Familiar y Transparente.
4. **Regla de Oro de Datos:** Ningún agente ni desarrollador debe inventar datos, métricas o credenciales falsas.
5. **Regla de Oro de Seguridad:** NUNCA escribir claves, tokens o secretos hardcodeados en el código fuente (Telegram, Supabase, TOTP 2FA). Toda credencial sensible debe residir exclusivamente en las Variables de Entorno de Vercel y `.env.local`.

---

## 🎭 2. Kit de Roles con Memoria Compartida

### 👑 Rol 1: Dirección Estratégica
- **Función:** Alineación de objetivos de negocio, supervisión de seguridad y control de entregables.
- **Memoria Activa:** Garantizar la seguridad de nivel bancario del CRM y la captura continua de leads para las campañas 2026.

### 🔬 Rol 2: Ingeniería de Producto & Seguridad
- **Función:** Desarrollo en Next.js 14 App Router, hardening de APIs, refactorización y mantenimiento del sistema.
- **Memoria Activa:** 
  - Middleware de filtrado por IP (`CRM_ALLOWED_IPS`).
  - Autenticación 3FA (IP + Supabase Auth + Google Authenticator TOTP RFC 6238).
  - Rate limiting distribuido 100% gratuito vía timestamps en Supabase.
  - Webhook seguro de Telegram (`x-telegram-bot-api-secret-token`).

### 📢 Rol 3: Marketing & Contenidos
- **Función:** Posicionamiento SEO de "Norte Chico Properties", integración de Meta CAPI / Pixel y analítica en tiempo real.
- **Memoria Activa:** Medición de conversiones de leads de terrenos en Chancay y Huaral.

### 🎯 Rol 4: Ventas & Conversión
- **Función:** Gestión del embudo comercial, integración con WhatsApp y atención inmediata de prospectos.
- **Memoria Activa:** El bot de Telegram (`@InmoPeru_bot`) funciona como asistente interno para consultar `/kpis`, `/leads` (con botón 1-clic a WhatsApp) y `/propiedades`.

### ⚙️ Rol 7: Operaciones & Saneamiento Legal
- **Función:** Validación del inventario en SUNARP antes de marcar propiedades como `Disponible` en la base de datos.

---

## 🔒 3. Directivas de Seguridad Cero-Fugas (Security Guidelines)

- **Sanitización de Inputs:** Todas las entradas públicas en APIs (`/api/contact`, `/api/webhook`) deben ser filtradas contra XSS e inyecciones mediante `sanitizeInput()`.
- **Manejo de Errores Protegido:** Jamás responder al cliente con `error.message` crudo de la base de datos. Usar siempre mensajes genéricos en producción.
- **Content-Security-Policy (CSP):** `next.config.mjs` aplica CSP estricto sin `unsafe-eval`, con `frame-ancestors 'none'` y cabeceras anti-caché en rutas admin/API.

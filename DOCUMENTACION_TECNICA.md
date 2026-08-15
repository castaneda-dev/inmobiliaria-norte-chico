# 📘 Manual Técnico, Arquitectura Modular y Guía de Seguridad — Inmobiliaria Norte Chico

> [!IMPORTANT]
> **ENTORNO DE PRODUCCIÓN Y REPOSITORIO GITHUB**
> Este repositorio corresponde al **ambiente de Producción** del proyecto (`PRODUCCION WEB INMOBILIARIA`), conectado a GitHub (`castaneda-dev/inmobiliaria-norte-chico`) y desplegado en Vercel (`inmobiliarianortechico.pe`). **Las variables y credenciales sensibles (tokens de Telegram, claves de Supabase, secretos TOTP 2FA, etc.) deben gestionarse exclusivamente mediante Variables de Entorno en Vercel / `.env.local` y NUNCA ser escritas en código duro.**

---

## 📑 Tabla de Contenidos
1. [Principios de Arquitectura Modular y Regla de Oro](#1-principios-de-arquitectura-modular-y-regla-de-oro)
2. [Mapa de Módulos del Sistema y Rutas de Next.js 14](#2-mapa-de-módulos-del-sistema-y-rutas-de-nextjs-14)
3. [Sistema de Seguridad Multi-Factor (3FA) del CRM](#3-sistema-de-seguridad-multi-factor-3fa-del-crm)
4. [Backend Serverless: Webhooks, Rate Limiting & Bot de Telegram](#4-backend-serverless-webhooks-rate-limiting--bot-de-telegram)
5. [Estrategias de Rendimiento, ISR & Optimización Visual](#5-estrategias-de-rendimiento-isr--optimización-visual)
6. [Hardening de Ciberseguridad, CSP & Políticas RLS](#6-hardening-de-ciberseguridad-csp--políticas-rls)
7. [Kit de Roles & Guía de Mantenimiento](#7-kit-de-roles--guía-de-mantenimiento)

---

## 1. Principios de Arquitectura Modular y Regla de Oro

El proyecto está diseñado bajo una **arquitectura modular Next.js 14 (App Router)** estricta, donde cada componente posee una responsabilidad única y fronteras bien definidas para garantizar mantenibilidad, seguridad y rendimiento.

> [!IMPORTANT]
> ### 🏆 Regla de Oro para Futuros Desarrollos
> Cualquier código, función o nueva característica que se agregue al proyecto en el futuro **deberá respetar estrictamente esta separación modular**.
> *Ejemplo*: Si se implementa un nuevo módulo de pagos o contratos en línea, **NO debe acoplarse en módulos ya existentes** a menos que sea una refactorización o mejora específica. Se debe crear su propia ruta `/api/...` o controlador dedicado.

---

## 2. Mapa de Módulos del Sistema y Rutas de Next.js 14

### 2.1. Módulo Core / Conexión a Base de Datos
- **Responsabilidad**: Inicialización centralizada de servicios base (Supabase) con validación estricta de variables de entorno.
- **Ubicación**: [src/supabaseClient.js](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/supabaseClient.js)

### 2.2. Módulo Landing Page Pública & Catálogo Híbrido
- **Responsabilidad**: Presentación de catálogo de terrenos en Chancay y Huaral, resolución dinámica de URLs amigables (`/[slug]`), precarga ISR y formularios de captación de leads.
- **Ubicación**: [src/app/page.jsx](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/app/page.jsx), [src/app/[slug]/page.jsx](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/app/[slug]/page.jsx)

### 2.3. Módulo Dashboard CRM de Administración
- **Responsabilidad**: Gestión privada de inventarios, prospectos, métricas y configuración de seguridad con tema Bento Box y visualización optimizada para dispositivos móviles.
- **Ubicación**: [src/components/admin/AdminDashboardView.jsx](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/components/admin/AdminDashboardView.jsx), [src/app/crm/page.jsx](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/app/crm/page.jsx)

---

## 3. Sistema de Seguridad Multi-Factor (3FA) del CRM

El acceso al CRM está blindado por tres niveles de autenticación independientes:

1. **Factor 1 (Filtrado por IP Whitelist Segura):** Evaluado en `src/middleware.js` mediante la variable `CRM_ALLOWED_IPS`. La validación prioriza cabeceras nativas inmutables del proveedor de infraestructura (`req.ip`, `x-vercel-forwarded-for`) para prevenir vulnerabilidades de **IP Spoofing** por parte de atacantes que intenten alterar `x-forwarded-for`.
2. **Factor 2 (Autenticación Supabase Auth):** Verificación de credenciales de usuario (email y contraseña).
3. **Factor 3 (Google Authenticator TOTP RFC 6238):** Verificación de código dinámico de 6 dígitos procesado en el servidor vía `src/app/api/crm_verify_2fa/route.js`. El secreto se gestiona mediante `CRM_TOTP_SECRET`.

---

## 4. Backend Serverless: Webhooks, Rate Limiting & Bot de Telegram

### 4.1. Asistente Interno de Telegram (`/api/telegram_webhook`)
- **Ubicación**: [src/app/api/telegram_webhook/route.js](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/app/api/telegram_webhook/route.js)
- **Seguridad**: Autenticado mediante cabecera `x-telegram-bot-api-secret-token` y la variable `TELEGRAM_WEBHOOK_SECRET`.
- **Comandos**:
  - `/kpis`: Mapeo de inventario (Disponibles, Reservados, Vendidos) y leads.
  - `/leads`: Últimos 5 prospectos con enlace directo de 1 clic a WhatsApp (`wa.me`).
  - `/propiedades`: Consulta de catálogo en vivo.

### 4.2. Notificaciones en Tiempo Real (`/api/contact`)
- **Ubicación**: [src/app/api/contact/route.js](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/src/app/api/contact/route.js)
- **Estrategia Rate Limiting Anti-Spoofing (MED-02):** Implementación distribuida 100% gratuita evaluando timestamps en Supabase (`gte.created_at`) combinada con ventana deslizante local. Protegida contra evasión y ataques masivos mediante validación estricta de la dirección IP (`x-vercel-forwarded-for`).
- **Honeypot Anti-Bot:** Campos invisibles `website` y `confirm_address` para atrapar robots de spam.
- **Alerta instantánea:** Emite un reporte con los datos del lead al chat personal del administrador (`TELEGRAM_CHAT_ID`).

---

## 5. Estrategias de Rendimiento, ISR & Optimización Visual

- **ISR Bajo Demanda:** Revalidación instantánea del catálogo mediante `revalidatePath('/')` al realizar mutaciones desde `src/app/actions/adminActions.js`.
- **Optimización WebP HD:** Reducción de imágenes a formato WebP optimizado manteniendo calidad retina de alta resolución para los terrenos de Glorieta Deluxe.

---

## 6. Hardening de Ciberseguridad, CSP & Políticas RLS

- **Content-Security-Policy (CSP):** Configurado en `next.config.mjs` eliminando la directiva `unsafe-eval`.
- **Headers Anti-Caché:** `Cache-Control: no-store, no-cache` aplicados estrictamente a las APIs y al panel CRM para prevenir fugas de memoria.
- **Sanitización Rigurosa:** Filtrado de caracteres de control e inyecciones mediante `sanitizeInput()`.
- **Políticas RLS en Supabase (Prevención de Data Scraping):** Las tablas críticas (`clientes` y `propiedades`) operan bajo Row Level Security (RLS) estricto. La llave anónima pública permite escritura de leads (solo `INSERT`), pero bloquea rotundamente la extracción o alteración de registros (`SELECT`, `UPDATE`, `DELETE`) para visitantes no autenticados.

---

## 7. Kit de Roles & Guía de Mantenimiento

Para detalles sobre los roles de la empresa y la memoria estratégica del proyecto, consultar [AGENTS.md](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/AGENTS.md) y [CLAUDE.md](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/CLAUDE.md).

# CLAUDE.md - Guía de Desarrollo y Reglas del Proyecto

## 🛠️ Comandos de Desarrollo
- **Dev Server:** `npm run dev`
- **Build de Producción:** `npm run build`
- **Servidor de Producción:** `npm start`
- **Linting:** `npm run lint`

---

## 🏗️ Arquitectura y Tecnologías
- **Framework:** Next.js 14 (App Router)
- **Base de Datos & Auth:** Supabase (PostgreSQL, Supabase Auth con `@supabase/ssr` para Cliente/Servidor seguro)
- **Estilos:** Vanilla CSS / TailwindCSS nativo
- **Notificaciones & Webhook:** Telegram Bot API (`@InmoPeru_bot`), Meta CAPI / Lead Ads
- **Seguridad 2FA:** Google Authenticator (TOTP RFC 6238) en `/api/crm_verify_2fa`

---

## 📌 Reglas de Negocio & Desarrollo
1. **Credenciales en Variables de Entorno:** NUNCA colocar claves, tokens o secretos hardcodeados en el código fuente. Usar exclusivamente `process.env`.
2. **Dynamic Rendering:** En API routes, incluir siempre `export const dynamic = 'force-dynamic'` para prevenir respuestas estáticas desactualizadas.
3. **Manejo de Errores Seguro:** No exponer detalles de errores internos de la BD en las respuestas HTTP.
4. **Sanitización y Validación:** Todo input del usuario o webhook debe ser validado y tipado estructuralmente usando esquemas de `zod` antes de tocar la base de datos.
5. **Autenticación SSR:** Para Server Actions y peticiones protegidas, la sesión debe validarse leyendo las cookies nativas (`cookies().get('sb-access-token')`) sin pasar tokens JWT manualmente por argumentos.
6. **Verificación de Seguridad:** Ejecutar `npm run build` antes de realizar commits.
6. **Prevención de IP Spoofing:** Priorizar siempre cabeceras seguras de infraestructura (`req.ip`, `x-vercel-forwarded-for`) en la extracción de IPs, desestimando la cabecera `x-forwarded-for` inyectada por clientes.
7. **Protección de Privacidad (RLS):** Garantizar políticas estrictas de Row Level Security en Supabase (ej. limitar el rol `anon` solo a `INSERT`) para impedir la lectura masiva de datos (Data Scraping).

---

## 📚 Documentación de Referencia
- [AGENTS.md](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/AGENTS.md) - Kit de Roles y Reglas de Negocio
- [DOCUMENTACION_TECNICA.md](file:///c:/Users/Usuario/OneDrive/Escritorio/PRODUCCION%20WEB%20INMOBILIARIA/DOCUMENTACION_TECNICA.md) - Manual Técnico Completo

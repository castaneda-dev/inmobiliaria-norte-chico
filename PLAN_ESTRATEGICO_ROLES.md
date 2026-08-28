# 📑 Kit de Roles con Memoria Compartida & Plan Estratégico
**Norte Chico Properties | Chancay & Huaral 2026**
*Documento Central de Operación y Memoria de Desarrollo*

---

## 📌 FICHA DEL NEGOCIO (Conexión Central del Sistema)
- **Qué hace el negocio:** Comercialización, desarrollo y gestión de ventas de lotes residenciales y casas en zonas de alta plusvalía urbana en Chancay y Huaral (Perú), impulsados por la expansión del Puerto Multipropósito de Chancay.
- **Objetivo actual:** Consolidar la plataforma web híbrida en Next.js (Ambiente Pruebas Web), garantizar seguridad de nivel bancario, optimizar el rendimiento y activar la captación de leads/inversionistas en 2026.
- **Cliente ideal:** 
  1. Familias locales y profesionales técnicos/administrativos que migran a Chancay por el polo logístico-industrial.
  2. Inversionistas individuales (Perú / Chile / Latinoamérica) en busca de terrenos con alta plusvalía garantizada.
- **Voz de marca:** Visionaria, Técnica, Confiable, Familiar y Transparente.
- **Oferta principal:** Intermediación inmobiliaria y venta directa de habilitaciones urbanas residenciales (Lotes y Casas).
- **Reglas Duras:** 
  - Ningún rol inventa datos o métricas falsas.
  - Todo cambio pasa primero por el ambiente físico `PRUEBAS WEB` antes de enviarse a `PRODUCCION WEB INMOBILIARIA`.
  - Revisión y aprobación previa en cada paso.

---

## 🟢 LO AVANZADO (MEMORIA HISTÓRICA & ESTADO ACTUAL)

### 🛠️ ROL 2 (Producto / Tecnología): Re-Arquitectura & Seguridad Next.js
1. **Segregación de Ambientes Físicos y Git:**
   - **Carpeta Pruebas:** `c:\Users\Usuario\OneDrive\Escritorio\PRUEBAS WEB` (Donde se desarrollan y validan todas las mejoras).
   - **Carpeta Producción:** `c:\Users\Usuario\OneDrive\Escritorio\PRODUCCION WEB INMOBILIARIA` (Ambiente seguro de despliegue final).
2. **Seguridad y Eliminación de Código Legado:**
   - **Depuración de Obfuscated JS:** Eliminación total de scripts `.obf.js` antiguos (`api.obf.js`, `index-app.obf.js`, `supabase_config.obf.js`). Toda la lógica ahora es 100% nativa en React/Next.js.
   - **Remoción de Credenciales Hardcodeadas:** Eliminación de accesos de prueba inseguros en el panel de administración (`AdminDashboardView.jsx`). Autenticación estricta vía Supabase Auth.
   - **Middleware Protector Server-Side (`src/middleware.js`):** Bloqueo a nivel de servidor de las rutas `/admin` y `/dashboard_admin` para usuarios sin sesión activa.
   - **Prevención de IP Spoofing (Nuevo):** Actualización del Middleware y API de contacto para priorizar cabeceras de infraestructura inmutables (`req.ip`, `x-vercel-forwarded-for`), asegurando la integridad del Rate Limiting y las listas blancas.
   - **Protección de Datos RLS (Nuevo):** Implementación de políticas de seguridad a nivel de fila (Row Level Security) en Supabase para bloquear la extracción masiva de datos y el acceso no autorizado de lectura desde la API pública.
   - **Arquitectura Supabase SSR (Nuevo):** Eliminación del cliente singleton obsoleto (`supabaseClient.js`) para migrar hacia `@supabase/ssr`, separando limpiamente el contexto del servidor y el cliente.
   - **Autenticación Segura (Server-Side Cookies):** Las Server Actions ya no exponen tokens JWT como argumentos. Utilizan `cookies().get('sb-access-token')` de forma invisible.
   - **Validación Estricta Zod (Nuevo):** Todos los inputs al backend (Server Actions de administración y Webhooks) son validadados estructuralmente mediante esquemas `zod` para prevenir inyecciones y Mass Assignment.
3. **Rendimiento y Optimización de Experiencia Visual:**
   - **ISR Bajo Demanda:** Eliminación del parpadeo de revalidación constante (`revalidate = 60`). La página principal es 100% estática y se revalida al instante (`revalidatePath('/')`) al modificar propiedades.
   - **Optimizador de Imágenes Next.js (`<Image>`):** Migración de elementos visuales al componente nativo de Next.js con configuración remota autorizada en `next.config.mjs`.
   - **Restauración de Calidad HD:** Re-generación del fondo `PR_GLORIETA_DELUXE.webp` en alta calidad (88% WebP, 97.6 KB) partiendo de la fuente PNG de 5.8 MB.
   - **Deduplicación de Consultas a BD:** Optimización de Ficha Técnica (`/proyecto/[id]`) usando `React.cache()` para reducir las consultas a la mitad, complementado con precarga de enlaces (`prefetch={true}`).
   - **Formato Ancho Completo & Navegación:** Corrección del módulo *Nuestra Colección Residencial* para abarcar el 100% del ancho con scroll suave.

---

## 🟡 LO PENDIENTE (PRÓXIMOS PASOS PRIORIZADOS)

### 💼 ROL 3 (Marketing) & ROL 4 (Ventas): Integración Meta y Pauta 2026
- **[PENDIENTE] Obtención de Meta Pixel ID:** Crear el conjunto de datos (Dataset) en Meta Business Manager y colocar el ID en `layout.jsx` para activar el rastreo de visitas y conversiones.
- **[PENDIENTE] Fase 3 - Automatizaciones Meta Business Suite:** Configurar las respuestas automáticas de bienvenida y fuera de horario en la bandeja unificada de FB + IG usando las plantillas de `estrategia_comunicacion_social.md`.
- **[PENDIENTE] URL de Facebook:** Confirmar la URL exacta de la página de Facebook para reemplazar los 3 marcadores `TODO` en `Footer.jsx`, `Navbar.jsx` y `ContactForm.jsx`.
- **[PENDIENTE] Lanzamiento de Pauta en Meta Ads:** Configurar la pauta publicitaria dirigida a las Fichas 1:1 optimizadas de los lotes en Huaral/Chancay.
- **[PENDIENTE] Matriz de Contenidos Plusvalía 2026:** Producir contenidos orgánicos sobre el impacto del Puerto de Chancay y la seguridad registral en Registros Públicos.

### ⚙️ ROL 7 (Operaciones) & ROL 6 (Finanzas): Gestión y Carga de Datos
- **[PENDIENTE] Carga de Inventario Completo:** Subir los nuevos lotes y terrenos a través del panel admin seguro (`/admin`), asegurando fotos en alta resolución y especificaciones exactas.

---

## 📋 REGISTRO DE ROLES (MEMORIA COMPARTIDA POR DEPARTAMENTO)

### 👑 ROL 1: Dirección Estratégica
- **Prioridad 1:** Garantizar la velocidad de carga y la seguridad del sistema (Cumplido).
- **Prioridad 2:** Iniciar la carga de catálogo real y preparación para campaña publicitaria.

### 🔬 ROL 2: Ingeniería de Producto & Arquitectura
- **Estado:** 
  - Código desplegado y sincronizado en GitHub/Vercel.
  - Metaetiqueta de verificación de dominio Facebook inyectada en `<head>`: `<meta name="facebook-domain-verification" content="tbgejpksn0jcdpp2uc332lrgl67p8l" />`.
  - Número de WhatsApp globalizado a `+51 904 669 316` (solo chat).
  - Íconos de redes sociales integrados de forma sutil y elegante en 3 puntos estratégicos sin saturar la UI.

### 📢 ROL 3: Marketing & Contenidos
- **Estado:** Estrategia de comunicación digital v2.0 aprobada y documentada en `estrategia_comunicacion_social.md` (con enfoque estricto en Registros Públicos y venta al contado sin mentiras ni datos inventados).

### 🎯 ROL 4: Ventas & Conversión
- **Embudo:** Flujo directo hacia WhatsApp (+51 904 669 316) y formulario de captación conectado a Supabase.

---

*Última actualización: 28 de Agosto de 2026 - Registrado en el sistema de memoria compartida.*


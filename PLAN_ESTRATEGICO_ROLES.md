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
   - **Server Actions Seguros (`src/app/actions/adminActions.js`):** Mutaciones (creación/edición/eliminación) ejecutadas exclusivamente en el servidor con validación de tokens.
3. **Rendimiento y Optimización de Experiencia Visual:**
   - **ISR Bajo Demanda:** Eliminación del parpadeo de revalidación constante (`revalidate = 60`). La página principal es 100% estática y se revalida al instante (`revalidatePath('/')`) al modificar propiedades.
   - **Optimizador de Imágenes Next.js (`<Image>`):** Migración de elementos visuales al componente nativo de Next.js con configuración remota autorizada en `next.config.mjs`.
   - **Restauración de Calidad HD:** Re-generación del fondo `PR_GLORIETA_DELUXE.webp` en alta calidad (88% WebP, 97.6 KB) partiendo de la fuente PNG de 5.8 MB.
   - **Deduplicación de Consultas a BD:** Optimización de Ficha Técnica (`/proyecto/[id]`) usando `React.cache()` para reducir las consultas a la mitad, complementado con precarga de enlaces (`prefetch={true}`).
   - **Formato Ancho Completo & Navegación:** Corrección del módulo *Nuestra Colección Residencial* para abarcar el 100% del ancho con scroll suave.

---

## 🟡 LO PENDIENTE (PRÓXIMOS PASOS PRIORIZADOS)

### 💼 ROL 4 (Ventas) & ROL 3 (Marketing): Tráfico y Conversión
- **[PENDIENTE] Lanzamiento de Pauta en Meta Ads:** Configurar la pauta con micro-presupuesto ($60.000 CLP / ~$2.000 CLP diarios) dirigiendo a las Fichas 1:1 optimizadas de los lotes en Huaral/Chancay.
- **[PENDIENTE] Matriz de Contenidos Plusvalía 2026:** Producir 5 contenidos orgánicos sobre el impacto del Puerto de Chancay en el valor por m² de los terrenos residenciales.
- **[PENDIENTE] Prospección Directa Outbound:** Publicar semanalmente en comunidades de inversionistas inmobiliarios destacando la garantía registral en SUNARP.

### ⚙️ ROL 7 (Operaciones) & ROL 6 (Finanzas): Gestión y Carga de Datos
- **[PENDIENTE] Carga de Inventario Completo:** Subir los nuevos lotes y terrenos a través del panel admin seguro (`/admin`), asegurando fotos en alta resolución y especificaciones exactas.
- **[PENDIENTE] Despliegue a Producción:** Una vez aprobada la fase en `PRUEBAS WEB`, ejecutar la copia de archivos verificados a `PRODUCCION WEB INMOBILIARIA` para sincronizar con los servidores finales.

---

## 📋 REGISTRO DE ROLES (MEMORIA COMPARTIDA POR DEPARTAMENTO)

### 👑 ROL 1: Dirección Estratégica
- **Prioridad 1:** Garantizar la velocidad de carga y la seguridad del sistema en `PRUEBAS WEB` (Cumplido).
- **Prioridad 2:** Iniciar la carga de catálogo real y preparación para campaña publicitaria.
- **Riesgos Identificados:** Evitar publicar en producción sin verificar previamente en el ambiente de pruebas.

### 🔬 ROL 2: Ingeniería de Producto & Arquitectura
- **Estado:** Arquitectura híbrida en Next.js completada. Código limpio de dependencias legadas u ofuscadas. Middleware mitigado contra IP Spoofing, base de datos blindada con RLS, Server Actions e ISR bajo demanda operativos.

### 📢 ROL 3: Marketing & Contenidos
- **Enfoque:** Posicionamiento de "Norte Chico Properties" como la opción de inversión residencial más segura en el hub logístico de Chancay.

### 🎯 ROL 4: Ventas & Conversión
- **Embudo:** Flujo de captura directo desde Ficha 1:1 y formulario hacia WhatsApp y base de clientes en Supabase.

### 🎧 ROL 5: Soporte & Atencion al Cliente
- **Protocolo:** Respuestas rápidas con datos de zonificación, saneamiento SUNARP y facilidades de pago confirmadas.

### 📊 ROL 6: Finanzas & Presupuesto
- **Presupuesto asignado:** Pauta Meta Ads $60.000 CLP mensual distribuida en campañas de consideración/tráfico.

### ⚙️ ROL 7: Operaciones & Debida Diligencia
- **Procedimiento:** Protocolo de verificación registral SUNARP previa para cada lote antes de habilitar su estado `Disponible` en el panel.

---

*Última actualización: 11 de Agosto de 2026 - Registrado en el sistema de memoria compartida.*

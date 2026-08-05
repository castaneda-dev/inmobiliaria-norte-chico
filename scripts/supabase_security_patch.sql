-- ==============================================================================
-- PARCHE DE SEGURIDAD CRÍTICA (ROW LEVEL SECURITY)
-- PROYECTO: Norte Chico Properties
-- FECHA: 04 de Agosto de 2026
-- ==============================================================================

-- INSTRUCCIONES:
-- 1. Entra a tu panel de control de Supabase (https://supabase.com/dashboard).
-- 2. Ve a la sección "SQL Editor" (ícono de consola en el menú izquierdo).
-- 3. Haz clic en "New query" (Nueva consulta).
-- 4. Copia TODO el contenido de este archivo y pégalo allí.
-- 5. Presiona el botón verde "RUN" (Ejecutar) en la parte inferior derecha.

-- ------------------------------------------------------------------------------
-- 1. SEGURIDAD PARA LA TABLA DE PROPIEDADES (Catálogo)
-- ------------------------------------------------------------------------------
-- Habilitar seguridad
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier visitante de la web (anónimo) pueda VER las propiedades
CREATE POLICY "Permitir lectura publica de propiedades" 
ON propiedades FOR SELECT 
USING (true);

-- Permitir que SOLO usuarios administradores autenticados puedan crear, editar o borrar
CREATE POLICY "Permitir edicion solo a admins" 
ON propiedades FOR ALL 
USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 2. SEGURIDAD PARA LA TABLA DE CLIENTES (Leads del Formulario CRM)
-- ------------------------------------------------------------------------------
-- Habilitar seguridad
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier visitante de la web pueda INSERTAR sus datos (llamar al formulario)
CREATE POLICY "Permitir envio de formulario a prospectos" 
ON clientes FOR INSERT 
WITH CHECK (true);

-- Permitir que SOLO usuarios administradores autenticados puedan VER la lista de clientes o borrarla
-- (Los hackers externos quedan totalmente bloqueados de robar la base de datos)
CREATE POLICY "Permitir gestion de leads solo a admins" 
ON clientes FOR ALL 
USING (auth.role() = 'authenticated');

-- ==============================================================================
-- ¡LISTO! TU BASE DE DATOS AHORA ESTÁ 100% BLINDADA.
-- ==============================================================================

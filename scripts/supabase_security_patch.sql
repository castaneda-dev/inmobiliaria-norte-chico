-- ==============================================================================
-- PARCHE DE SEGURIDAD CRÍTICA BLINDADA (ROW LEVEL SECURITY V2)
-- PROYECTO: Norte Chico Properties
-- FECHA: 10 de Agosto de 2026
-- ==============================================================================

-- INSTRUCCIONES:
-- 1. Entra a tu panel de control de Supabase (https://supabase.com/dashboard).
-- 2. Ve a la sección "SQL Editor" (ícono de consola en el menú izquierdo).
-- 3. Haz clic en "New query" (Nueva consulta).
-- 4. Copia TODO el contenido de este archivo y pégalo allí.
-- 5. Presiona el botón verde "RUN" (Ejecutar) en la parte inferior derecha.

-- ------------------------------------------------------------------------------
-- 1. LIMPIEZA DE POLÍTICAS ANTIGUAS/INSEGURA (SI EXISTEN)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir edicion solo a admins" ON propiedades;
DROP POLICY IF EXISTS "Permitir gestion de leads solo a admins" ON clientes;
DROP POLICY IF EXISTS "Permitir lectura publica de propiedades" ON propiedades;
DROP POLICY IF EXISTS "Permitir envio de formulario a prospectos" ON clientes;
DROP POLICY IF EXISTS "propiedades_select_public" ON propiedades;
DROP POLICY IF EXISTS "propiedades_insert_admin" ON propiedades;
DROP POLICY IF EXISTS "propiedades_update_admin" ON propiedades;
DROP POLICY IF EXISTS "propiedades_delete_admin" ON propiedades;
DROP POLICY IF EXISTS "clientes_insert_public" ON clientes;
DROP POLICY IF EXISTS "clientes_select_admin" ON clientes;
DROP POLICY IF EXISTS "clientes_update_admin" ON clientes;
DROP POLICY IF EXISTS "clientes_delete_admin" ON clientes;

-- ------------------------------------------------------------------------------
-- 2. SEGURIDAD PARA LA TABLA DE PROPIEDADES (Catálogo)
-- ------------------------------------------------------------------------------
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública a cualquier visitante (anónimo o autenticado)
CREATE POLICY "propiedades_select_public" 
ON propiedades FOR SELECT 
TO anon, authenticated 
USING (true);

-- Permitir INSERT, UPDATE, DELETE solo a usuarios con rol 'admin' en app_metadata
CREATE POLICY "propiedades_insert_admin" 
ON propiedades FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

CREATE POLICY "propiedades_update_admin" 
ON propiedades FOR UPDATE 
TO authenticated 
USING (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
)
WITH CHECK (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

CREATE POLICY "propiedades_delete_admin" 
ON propiedades FOR DELETE 
TO authenticated 
USING (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

-- ------------------------------------------------------------------------------
-- 3. SEGURIDAD PARA LA TABLA DE CLIENTES (Leads CRM)
-- ------------------------------------------------------------------------------
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Permitir envío público de formularios de prospectos
CREATE POLICY "clientes_insert_public" 
ON clientes FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir lectura, edición y eliminación de leads ÚNICAMENTE a administradores
CREATE POLICY "clientes_select_admin" 
ON clientes FOR SELECT 
TO authenticated 
USING (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

CREATE POLICY "clientes_update_admin" 
ON clientes FOR UPDATE 
TO authenticated 
USING (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
)
WITH CHECK (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

CREATE POLICY "clientes_delete_admin" 
ON clientes FOR DELETE 
TO authenticated 
USING (
  (SELECT (auth.jwt()->'app_metadata'->>'role')::text) = 'admin'
);

-- ------------------------------------------------------------------------------
-- 4. CONFIGURAR ROL ADMIN PARA TU USUARIO (REEMPLAZA EL EMAIL)
-- ------------------------------------------------------------------------------
-- Ejecuta esto cambiando 'tu_email@ejemplo.com' por el correo de tu cuenta admin en Supabase:
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb 
-- WHERE email = 'admin@inmobiliarianortechico.pe';

-- ==============================================================================
-- ¡LISTO! TU BASE DE DATOS AHORA TIENE POLÍTICAS RLS SEGURAS Y MODERNAS.
-- ==============================================================================

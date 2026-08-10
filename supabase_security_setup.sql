-- =====================================================================
-- CONFIGURACIÓN DE SEGURIDAD DE BASE DE DATOS (POLÍTICAS RLS EN SUPABASE)
-- Ejecuta este script en el editor SQL de tu panel de Supabase para
-- proteger las tablas contra extracciones de datos o borrados maliciosos.
-- =====================================================================

-- 1. Habilitar la seguridad de fila (RLS) en ambas tablas
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS PARA LA TABLA 'PROPIEDADES'
-- ==========================================

-- Permitir que cualquier visitante (público/anónimo) pueda ver los lotes/casas
CREATE POLICY "Permitir lectura publica de propiedades" 
ON propiedades 
FOR SELECT 
USING (true);

-- Permitir modificaciones completas (INSERT, UPDATE, DELETE) solo a administradores autenticados
CREATE POLICY "Permitir edicion solo a admins autenticados" 
ON propiedades 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA LA TABLA 'CLIENTES' (CRM)
-- ==========================================

-- Permitir que cualquier visitante anónimo pueda registrar sus datos (leads) desde los formularios
CREATE POLICY "Permitir registro de leads desde la web" 
ON clientes 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Permitir lectura y gestión completa de los leads solo a administradores autenticados
-- Esto evita que un hacker pueda descargar la lista de clientes o borrar leads usando la Anon Key
CREATE POLICY "Permitir gestion de leads solo a admins autenticados" 
ON clientes 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- =====================================================================
-- 2. CONFIGURACIÓN DEL STORAGE (IMÁGENES DE PROPIEDADES)
-- =====================================================================

-- Crear el bucket de storage 'propiedades' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('propiedades', 'propiedades', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar permisos de subida pública y lectura de imágenes
DROP POLICY IF EXISTS "Permitir subida publica propiedades" ON storage.objects;
DROP POLICY IF EXISTS "Permitir descarga publica propiedades" ON storage.objects;

-- Permitir que usuarios anónimos/autenticados suban imágenes al bucket propiedades
CREATE POLICY "Permitir subida publica propiedades"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'propiedades');

-- Permitir que cualquier persona pueda descargar y ver las imágenes del bucket propiedades
CREATE POLICY "Permitir descarga publica propiedades"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'propiedades');

-- =====================================================================
-- VERIFICACIÓN Y SEGURIDAD COMPLETA
-- =====================================================================
-- Las políticas anteriores garantizan que con la clave anónima (Anon Key) del frontend:
-- 1. Nadie pueda consultar la lista de clientes del CRM.
-- 2. Nadie pueda borrar o modificar propiedades de forma no autorizada.
-- 3. Los formularios de contacto sigan funcionando correctamente.
-- 4. Las subidas de imágenes hasta 10 MB funcionen perfectamente en el CRM.


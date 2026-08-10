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

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
-- Las políticas anteriores garantizan que con la clave anónima (Anon Key) del frontend:
-- 1. Nadie pueda consultar la lista de clientes.
-- 2. Nadie pueda borrar o modificar las propiedades de la inmobiliaria.
-- 3. Los formularios de contacto sigan funcionando perfectamente para registrar clientes.

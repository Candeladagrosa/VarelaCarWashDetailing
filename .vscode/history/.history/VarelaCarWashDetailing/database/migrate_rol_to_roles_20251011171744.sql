-- ============================================
-- OPCIÓN 1: Migrar de 'rol' a 'roles'
-- Usa este script si decides mantener la nueva tabla 'roles'
-- ============================================

-- ADVERTENCIA: Este script eliminará la tabla 'rol' y sus datos
-- Ejecuta primero diagnose_roles_conflict.sql para verificar qué datos perderás

BEGIN;

-- 1. Guardar los datos de la tabla vieja 'rol' (si existen)
CREATE TEMP TABLE temp_rol_backup AS
SELECT * FROM public.rol;

-- 2. Verificar cuántos registros tenemos
SELECT COUNT(*) as registros_en_tabla_rol FROM temp_rol_backup;

-- 3. Si la tabla 'perfiles' hace referencia a 'rol', hay que cambiarla
-- Primero, verificar si existe la constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%perfiles%rol%'
        AND table_name = 'perfiles'
    ) THEN
        -- Eliminar la foreign key vieja
        ALTER TABLE public.perfiles 
        DROP CONSTRAINT IF EXISTS perfiles_id_rol_fkey;
        
        ALTER TABLE public.perfiles 
        DROP CONSTRAINT IF EXISTS perfiles_rol_fkey;
    END IF;
END $$;

-- 4. Si existe una columna que hace referencia a 'rol', renombrarla
-- Verificar si perfiles.id_rol o perfiles.rol_id existe
DO $$
BEGIN
    -- Si la columna se llama 'rol_id', cambiarla a 'id_rol'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'perfiles' 
        AND column_name = 'rol_id'
    ) THEN
        ALTER TABLE public.perfiles 
        RENAME COLUMN rol_id TO id_rol;
    END IF;
END $$;

-- 5. Crear la foreign key correcta apuntando a 'roles'
ALTER TABLE public.perfiles 
ADD CONSTRAINT perfiles_id_rol_fkey 
FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);

-- 6. Migrar datos de 'rol' a 'roles' (si hay datos valiosos)
-- IMPORTANTE: Ajusta este INSERT según la estructura real de tu tabla 'rol'
-- Comentado por seguridad - descomenta y ajusta según necesites
/*
INSERT INTO public.roles (nombre, descripcion, activo)
SELECT nombre, descripcion, true
FROM temp_rol_backup
WHERE nombre NOT IN (SELECT nombre FROM public.roles)
ON CONFLICT (nombre) DO NOTHING;
*/

-- 7. Eliminar la tabla vieja 'rol'
DROP TABLE IF EXISTS public.rol CASCADE;

-- 8. Verificar que todo quedó bien
SELECT 
    'roles' as tabla,
    COUNT(*) as cantidad_registros
FROM public.roles
UNION ALL
SELECT 
    'perfiles_con_rol' as tabla,
    COUNT(*) as cantidad_registros
FROM public.perfiles
WHERE id_rol IS NOT NULL;

COMMIT;

-- 9. Verificación final
SELECT 
    p.nombre,
    p.apellido,
    r.nombre as rol
FROM public.perfiles p
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
LIMIT 10;

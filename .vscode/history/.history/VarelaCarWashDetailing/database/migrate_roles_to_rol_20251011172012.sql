-- ============================================
-- OPCIÓN 2: Usar la tabla existente 'rol' 
-- Eliminar 'roles' y ajustar 'rol' a la nueva estructura
-- ============================================

-- ADVERTENCIA: Este script eliminará la tabla 'roles' nueva
-- Usa esta opción si prefieres mantener la tabla 'rol' existente

BEGIN;

-- 1. Verificar estructura actual de 'rol'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rol' 
ORDER BY ordinal_position;

-- 2. Eliminar la tabla 'roles' (nueva) y sus dependencias
DROP TABLE IF EXISTS public.rol_permisos CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 3. Renombrar 'rol' a 'roles' para mantener consistencia con el código
ALTER TABLE public.rol RENAME TO roles;

-- 4. Ajustar la columna ID si es necesario
-- Si la tabla tenía 'id', cambiarla a 'id_rol'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'roles' 
        AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'roles' 
        AND column_name = 'id_rol'
    ) THEN
        ALTER TABLE public.roles RENAME COLUMN id TO id_rol;
    END IF;
END $$;

-- 5. Agregar columnas faltantes si no existen
ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN DEFAULT false;

ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Asegurar que 'nombre' sea UNIQUE
ALTER TABLE public.roles 
ADD CONSTRAINT roles_nombre_unique UNIQUE (nombre);

-- 7. Recrear la tabla rol_permisos
CREATE TABLE IF NOT EXISTS public.rol_permisos (
    id_rol INTEGER REFERENCES public.roles(id_rol) ON DELETE CASCADE,
    id_permiso INTEGER REFERENCES public.permisos(id_permiso) ON DELETE CASCADE,
    asignado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    asignado_por UUID REFERENCES auth.users(id),
    PRIMARY KEY (id_rol, id_permiso)
);

-- 8. Habilitar RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS
DROP POLICY IF EXISTS "Roles visibles para usuarios autenticados" ON public.roles;
CREATE POLICY "Roles visibles para usuarios autenticados"
    ON public.roles FOR SELECT
    TO authenticated
    USING (activo = true);

DROP POLICY IF EXISTS "Solo admins pueden gestionar roles" ON public.roles;
CREATE POLICY "Solo admins pueden gestionar roles"
    ON public.roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.id_rol = 1
        )
    );

-- 10. Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Verificación
SELECT * FROM public.roles ORDER BY id_rol;

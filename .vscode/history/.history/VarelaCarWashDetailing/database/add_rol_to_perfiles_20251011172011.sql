-- ============================================
-- Migración: Agregar columna id_rol a perfiles
-- ============================================

-- Agregar columna id_rol a la tabla perfiles
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS id_rol INTEGER REFERENCES public.roles(id_rol);

-- Establecer valor por defecto: Cliente (id_rol = 3)
UPDATE public.perfiles 
SET id_rol = 3 
WHERE id_rol IS NULL;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(id_rol);

-- Verificar la estructura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
ORDER BY ordinal_position;

-- Verificar que los usuarios tengan roles asignados
SELECT 
    p.id,
    p.nombre,
    p.apellido,
    au.email,
    p.id_rol,
    r.nombre as rol
FROM public.perfiles p
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
ORDER BY p.created_at DESC;

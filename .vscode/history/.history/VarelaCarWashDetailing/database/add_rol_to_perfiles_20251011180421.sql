-- ============================================
-- NOTA: Este script YA NO ES NECESARIO
-- La tabla perfiles ya tiene la columna id_rol con foreign key a roles
-- ============================================

-- Este archivo se mantiene solo como referencia histórica
-- NO LO EJECUTES - la columna ya existe

-- Verificar que la columna existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
AND column_name = 'id_rol';

-- Verificar que el foreign key existe
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'perfiles'
AND ccu.table_name = 'roles';

-- Verificar usuarios con sus roles
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
ORDER BY p.updated_at DESC;

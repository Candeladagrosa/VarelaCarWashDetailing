-- ============================================
-- DIAGNÓSTICO: Conflicto entre tablas rol y roles
-- ============================================

-- 1. Verificar si existe la tabla 'rol'
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rol'
) as tabla_rol_existe;

-- 2. Verificar si existe la tabla 'roles'
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'roles'
) as tabla_roles_existe;

-- 3. Estructura de la tabla 'rol' (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rol'
ORDER BY ordinal_position;

-- 4. Estructura de la tabla 'roles' (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'roles'
ORDER BY ordinal_position;

-- 5. Datos en la tabla 'rol' (si existe)
SELECT * FROM public.rol ORDER BY id LIMIT 10;

-- 6. Datos en la tabla 'roles' (si existe)
SELECT * FROM public.roles ORDER BY id_rol LIMIT 10;

-- 7. Verificar referencias a 'rol' en otras tablas
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'rol'
ORDER BY tc.table_name;

-- 8. Verificar referencias a 'roles' en otras tablas
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'roles'
ORDER BY tc.table_name;

-- ============================================
-- DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS
-- Ejecuta este archivo completo y envíame TODOS los resultados
-- ============================================

-- ====================
-- 1. INFORMACIÓN DE LA TABLA PERFILES
-- ====================
SELECT '=== 1. ESTRUCTURA DE LA TABLA PERFILES ===' as seccion;

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
ORDER BY ordinal_position;

-- ====================
-- 2. INFORMACIÓN DE LAS TABLAS ROL Y ROLES
-- ====================
SELECT '=== 2A. ¿EXISTE LA TABLA ROL? ===' as seccion;

SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rol'
) as tabla_rol_existe;

SELECT '=== 2B. ¿EXISTE LA TABLA ROLES? ===' as seccion;

SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'roles'
) as tabla_roles_existe;

-- ====================
-- 3. ESTRUCTURA DE LA TABLA ROL (SI EXISTE)
-- ====================
SELECT '=== 3. ESTRUCTURA DE LA TABLA ROL (SI EXISTE) ===' as seccion;

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rol'
ORDER BY ordinal_position;

-- ====================
-- 4. ESTRUCTURA DE LA TABLA ROLES (SI EXISTE)
-- ====================
SELECT '=== 4. ESTRUCTURA DE LA TABLA ROLES (SI EXISTE) ===' as seccion;

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'roles'
ORDER BY ordinal_position;

-- ====================
-- 5. DATOS EN LA TABLA ROL (SI EXISTE)
-- ====================
SELECT '=== 5. DATOS EN LA TABLA ROL ===' as seccion;

-- Ajusta 'id' al nombre correcto de la columna primary key si es diferente
SELECT * FROM public.rol ORDER BY id LIMIT 10;

-- ====================
-- 6. DATOS EN LA TABLA ROLES (SI EXISTE)
-- ====================
SELECT '=== 6. DATOS EN LA TABLA ROLES ===' as seccion;

SELECT * FROM public.roles ORDER BY id_rol LIMIT 10;

-- ====================
-- 7. FOREIGN KEYS QUE APUNTAN A ROL
-- ====================
SELECT '=== 7. FOREIGN KEYS QUE APUNTAN A ROL ===' as seccion;

SELECT 
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name AS tabla_destino,
    ccu.column_name AS columna_destino,
    tc.constraint_name as nombre_constraint
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'rol'
ORDER BY tc.table_name;

-- ====================
-- 8. FOREIGN KEYS QUE APUNTAN A ROLES
-- ====================
SELECT '=== 8. FOREIGN KEYS QUE APUNTAN A ROLES ===' as seccion;

SELECT 
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name AS tabla_destino,
    ccu.column_name AS columna_destino,
    tc.constraint_name as nombre_constraint
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'roles'
ORDER BY tc.table_name;

-- ====================
-- 9. OTRAS TABLAS IMPORTANTES
-- ====================
SELECT '=== 9. LISTA DE TODAS LAS TABLAS EN PUBLIC ===' as seccion;

SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ====================
-- 10. VERIFICAR TABLA PERMISOS
-- ====================
SELECT '=== 10. ¿EXISTE LA TABLA PERMISOS? ===' as seccion;

SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'permisos'
) as tabla_permisos_existe;

-- ====================
-- 11. ESTRUCTURA DE PERMISOS (SI EXISTE)
-- ====================
SELECT '=== 11. ESTRUCTURA DE LA TABLA PERMISOS (SI EXISTE) ===' as seccion;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'permisos'
ORDER BY ordinal_position;

-- ====================
-- 12. VERIFICAR TABLA ROL_PERMISOS
-- ====================
SELECT '=== 12. ¿EXISTE LA TABLA ROL_PERMISOS? ===' as seccion;

SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rol_permisos'
) as tabla_rol_permisos_existe;

-- ====================
-- 13. MUESTRA DE DATOS EN PERFILES
-- ====================
SELECT '=== 13. MUESTRA DE DATOS EN PERFILES (SIN DATOS SENSIBLES) ===' as seccion;

SELECT 
    id,
    nombre,
    apellido,
    dni,
    -- No mostrar email completo por seguridad
    SUBSTRING(id::text, 1, 8) || '...' as id_parcial
FROM public.perfiles
LIMIT 5;

-- ====================
-- 14. VERIFICAR SI PERFILES TIENE COLUMNA DE FECHA
-- ====================
SELECT '=== 14. COLUMNAS DE FECHA EN PERFILES ===' as seccion;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
AND (
    column_name ILIKE '%created%' 
    OR column_name ILIKE '%fecha%'
    OR column_name ILIKE '%date%'
    OR data_type LIKE '%timestamp%'
)
ORDER BY ordinal_position;

-- ====================
-- FIN DEL DIAGNÓSTICO
-- ====================
SELECT '=== DIAGNÓSTICO COMPLETO ===' as mensaje;

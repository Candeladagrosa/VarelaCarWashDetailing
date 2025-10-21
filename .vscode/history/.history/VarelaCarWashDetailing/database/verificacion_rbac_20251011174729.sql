-- ============================================
-- VERIFICACIÓN FINAL DEL SISTEMA RBAC
-- ============================================

SELECT '=== ESTADO ACTUAL DEL SISTEMA RBAC ===' as mensaje;

-- 1. Verificar que todas las tablas existen
SELECT '--- 1. Tablas RBAC ---' as seccion;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('roles', 'permisos', 'rol_permisos', 'auditoria') THEN '✓ OK'
        ELSE '? Inesperada'
    END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('roles', 'permisos', 'rol_permisos', 'auditoria', 'perfiles')
ORDER BY table_name;

-- 2. Verificar roles del sistema
SELECT '--- 2. Roles del Sistema ---' as seccion;
SELECT 
    id_rol,
    nombre,
    es_sistema,
    activo,
    CASE 
        WHEN id_rol IN (1, 2, 3) AND es_sistema = true AND activo = true THEN '✓ OK'
        ELSE '⚠ Revisar'
    END as estado
FROM public.roles
ORDER BY id_rol;

-- 3. Contar permisos
SELECT '--- 3. Permisos Creados ---' as seccion;
SELECT 
    modulo,
    COUNT(*) as cantidad_permisos
FROM public.permisos
GROUP BY modulo
ORDER BY modulo;

-- 4. Permisos asignados por rol
SELECT '--- 4. Permisos Asignados por Rol ---' as seccion;
SELECT 
    r.nombre as rol,
    COUNT(rp.id_permiso) as permisos_asignados,
    CASE 
        WHEN r.id_rol = 1 AND COUNT(rp.id_permiso) > 30 THEN '✓ Admin completo'
        WHEN r.id_rol = 2 AND COUNT(rp.id_permiso) BETWEEN 8 AND 12 THEN '✓ Vendedor OK'
        WHEN r.id_rol = 3 AND COUNT(rp.id_permiso) BETWEEN 5 AND 8 THEN '✓ Cliente OK'
        ELSE '⚠ Revisar'
    END as estado
FROM public.roles r
LEFT JOIN public.rol_permisos rp ON r.id_rol = rp.id_rol
GROUP BY r.id_rol, r.nombre
ORDER BY r.id_rol;

-- 5. Verificar que perfiles tiene la columna id_rol
SELECT '--- 5. Estructura de Perfiles ---' as seccion;
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name = 'id_rol' THEN '✓ Columna necesaria presente'
        WHEN column_name = 'estado' THEN '✓ Columna estado presente'
        WHEN column_name = 'updated_at' THEN '✓ Columna fecha presente'
        ELSE 'ℹ Otra columna'
    END as estado
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
AND column_name IN ('id', 'id_rol', 'nombre', 'apellido', 'dni', 'telefono', 'estado', 'updated_at')
ORDER BY ordinal_position;

-- 6. Foreign Keys importantes
SELECT '--- 6. Foreign Keys del Sistema ---' as seccion;
SELECT 
    tc.table_name as tabla_origen,
    kcu.column_name as columna,
    ccu.table_name AS tabla_destino,
    tc.constraint_name,
    CASE 
        WHEN tc.table_name = 'perfiles' AND ccu.table_name = 'roles' THEN '✓ Crítico OK'
        WHEN tc.table_name = 'rol_permisos' THEN '✓ Relación OK'
        ELSE 'ℹ Otro'
    END as estado
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (
    (tc.table_name = 'perfiles' AND ccu.table_name = 'roles')
    OR tc.table_name = 'rol_permisos'
)
ORDER BY tc.table_name;

-- 7. Usuarios con roles asignados
SELECT '--- 7. Usuarios y sus Roles ---' as seccion;
SELECT 
    p.nombre || ' ' || p.apellido as usuario,
    r.nombre as rol,
    p.estado,
    CASE 
        WHEN p.estado = true AND p.id_rol IS NOT NULL THEN '✓ Usuario activo con rol'
        WHEN p.estado = false THEN 'ℹ Usuario inactivo'
        WHEN p.id_rol IS NULL THEN '⚠ Sin rol asignado'
        ELSE '? Revisar'
    END as estado
FROM public.perfiles p
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
ORDER BY p.updated_at DESC
LIMIT 10;

-- 8. Funciones del sistema
SELECT '--- 8. Funciones RBAC ---' as seccion;
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('get_user_permissions', 'user_has_permission', 'audit_trigger_func') THEN '✓ Función crítica OK'
        ELSE 'ℹ Otra función'
    END as estado
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_permissions', 'user_has_permission', 'audit_trigger_func', 'update_updated_at_column')
ORDER BY routine_name;

-- 9. Políticas RLS activas
SELECT '--- 9. Row Level Security (RLS) ---' as seccion;
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN tablename IN ('roles', 'permisos', 'rol_permisos', 'auditoria') THEN '✓ Tabla protegida'
        ELSE 'ℹ Otra tabla'
    END as estado
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('roles', 'permisos', 'rol_permisos', 'auditoria')
ORDER BY tablename, policyname;

-- 10. Resumen final
SELECT '--- 10. RESUMEN FINAL ---' as seccion;
SELECT 
    'Tablas RBAC' as componente,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('roles', 'permisos', 'rol_permisos', 'auditoria')) as cantidad,
    '4 esperadas' as esperado,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name IN ('roles', 'permisos', 'rol_permisos', 'auditoria')) = 4 
        THEN '✓ OK' 
        ELSE '⚠ Falta alguna' 
    END as estado
UNION ALL
SELECT 
    'Roles del sistema' as componente,
    COUNT(*)::text as cantidad,
    '3 esperados (Admin, Vendedor, Cliente)' as esperado,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✓ OK' 
        ELSE '⚠ Faltan roles' 
    END as estado
FROM public.roles
WHERE es_sistema = true
UNION ALL
SELECT 
    'Permisos totales' as componente,
    COUNT(*)::text as cantidad,
    '~35 esperados' as esperado,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✓ OK' 
        ELSE '⚠ Faltan permisos' 
    END as estado
FROM public.permisos
UNION ALL
SELECT 
    'Usuarios con rol' as componente,
    COUNT(*)::text as cantidad,
    'Todos los usuarios' as esperado,
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM public.perfiles) THEN '✓ OK' 
        ELSE '⚠ Hay usuarios sin rol' 
    END as estado
FROM public.perfiles
WHERE id_rol IS NOT NULL;

SELECT '=== FIN DE LA VERIFICACIÓN ===' as mensaje;

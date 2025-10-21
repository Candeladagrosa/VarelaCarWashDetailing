-- ============================================
-- DIAGNÓSTICO: Estructura de Turnos y Pedidos
-- ============================================

-- 1. Estructura de la tabla turnos
SELECT '=== ESTRUCTURA DE TURNOS ===' as seccion;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'turnos'
ORDER BY ordinal_position;

-- 2. Estructura de la tabla pedidos
SELECT '=== ESTRUCTURA DE PEDIDOS ===' as seccion;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- 3. Estructura de pedido_productos (relación)
SELECT '=== ESTRUCTURA DE PEDIDO_PRODUCTOS ===' as seccion;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pedido_productos'
ORDER BY ordinal_position;

-- 4. Verificar nombre correcto de la tabla de relación
SELECT '=== TABLAS QUE CONTIENEN "PEDIDO" ===' as seccion;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%pedido%'
ORDER BY table_name;

-- 5. Muestra de datos en turnos
SELECT '=== MUESTRA DE TURNOS ===' as seccion;
SELECT 
    id_turno,
    id_usuario,
    id_servicio,
    fecha,
    estado
FROM public.turnos
LIMIT 3;

-- 6. Muestra de datos en pedidos
SELECT '=== MUESTRA DE PEDIDOS ===' as seccion;
SELECT 
    id_pedido,
    id_usuario,
    fecha,
    total,
    estado_pago,
    estado_envio
FROM public.pedidos
LIMIT 3;

-- 7. Foreign keys de turnos
SELECT '=== FOREIGN KEYS DE TURNOS ===' as seccion;
SELECT 
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name AS tabla_destino,
    ccu.column_name AS columna_destino
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'turnos';

-- 8. Foreign keys de pedidos
SELECT '=== FOREIGN KEYS DE PEDIDOS ===' as seccion;
SELECT 
    tc.table_name as tabla_origen,
    kcu.column_name as columna_origen,
    ccu.table_name AS tabla_destino,
    ccu.column_name AS columna_destino
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'pedidos';

-- Verificar estructura completa para el historial
-- Este script ayuda a identificar problemas con las relaciones y datos

-- 1. Verificar estructura de turnos
SELECT 
    'Estructura de turnos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'turnos'
ORDER BY ordinal_position;

-- 2. Verificar estructura de pedidos
SELECT 
    'Estructura de pedidos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- 3. Verificar estructura de pedido_productos
SELECT 
    'Estructura de pedido_productos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedido_productos'
ORDER BY ordinal_position;

-- 4. Verificar foreign keys de turnos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'turnos';

-- 5. Verificar foreign keys de pedidos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'pedidos';

-- 6. Verificar foreign keys de pedido_productos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'pedido_productos';

-- 7. Mostrar datos de ejemplo de turnos con joins
SELECT 
    t.id_turno,
    t.id_cliente,
    t.id_servicio,
    t.fecha,
    t.hora,
    t.estado,
    s.nombre as servicio_nombre,
    s.precio as servicio_precio
FROM turnos t
LEFT JOIN servicios s ON t.id_servicio = s.id_servicio
LIMIT 5;

-- 8. Mostrar datos de ejemplo de pedidos con joins
SELECT 
    p.id_pedido,
    p.id_cliente,
    p.fecha_pedido,
    p.estado_pago,
    p.estado_envio,
    p.total,
    COUNT(pp.id_pedido_producto) as cantidad_productos
FROM pedidos p
LEFT JOIN pedido_productos pp ON p.id_pedido = pp.id_pedido
GROUP BY p.id_pedido
LIMIT 5;

-- 9. Verificar relación pedido_productos -> productos
SELECT 
    pp.id_pedido_producto,
    pp.id_pedido,
    pp.id_producto,
    pp.cantidad,
    pp.precio,
    pr.nombre as producto_nombre,
    pr.imagen_url
FROM pedido_productos pp
LEFT JOIN productos pr ON pp.id_producto = pr.id_producto
LIMIT 5;

-- 10. Verificar si hay datos con el usuario actual (reemplazar con tu user_id)
-- Nota: Ejecuta esto reemplazando 'TU_USER_ID' con el id real del usuario
SELECT 
    'Turnos del usuario' as tipo,
    COUNT(*) as cantidad
FROM turnos
WHERE id_cliente = 'TU_USER_ID'
UNION ALL
SELECT 
    'Pedidos del usuario' as tipo,
    COUNT(*) as cantidad
FROM pedidos
WHERE id_cliente = 'TU_USER_ID';

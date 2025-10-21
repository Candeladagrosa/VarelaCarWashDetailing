-- Diagnóstico específico para turnos y servicios

-- 1. Verificar la estructura de la tabla servicios
SELECT 
    'Estructura de servicios' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'servicios'
ORDER BY ordinal_position;

-- 2. Verificar las foreign keys de turnos hacia servicios
SELECT
    tc.constraint_name,
    kcu.column_name AS turno_column,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'turnos'
    AND ccu.table_name = 'servicios';

-- 3. Verificar datos de ejemplo con JOIN manual
SELECT 
    t.id_turno,
    t.id_cliente,
    t.id_servicio,
    t.fecha,
    t.hora,
    t.estado,
    s.id_servicio as servicio_id,
    s.nombre as servicio_nombre,
    s.precio as servicio_precio,
    s.duracion_estimada
FROM turnos t
LEFT JOIN servicios s ON t.id_servicio = s.id_servicio
LIMIT 5;

-- 4. Verificar si hay turnos huérfanos (sin servicio asociado)
SELECT 
    COUNT(*) as turnos_sin_servicio
FROM turnos t
LEFT JOIN servicios s ON t.id_servicio = s.id_servicio
WHERE s.id_servicio IS NULL;

-- 5. Verificar todos los servicios disponibles
SELECT 
    id_servicio,
    nombre,
    precio,
    duracion_estimada
FROM servicios
ORDER BY id_servicio;

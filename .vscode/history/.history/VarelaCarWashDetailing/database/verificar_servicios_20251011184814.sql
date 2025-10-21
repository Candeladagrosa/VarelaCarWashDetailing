-- Verificar estructura exacta de la tabla servicios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'servicios'
ORDER BY ordinal_position;

-- Ver datos de ejemplo
SELECT * FROM servicios LIMIT 5;

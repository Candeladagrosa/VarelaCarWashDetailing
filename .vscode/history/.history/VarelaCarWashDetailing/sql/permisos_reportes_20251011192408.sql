-- Script para crear permisos del módulo de Reportes
-- Ejecutar en Supabase SQL Editor

-- ========================================
-- FASE 1: Reportes Básicos de Exportación
-- ========================================

-- Insertar permisos para el módulo de reportes
INSERT INTO permisos (nombre, descripcion, codigo, modulo, accion) VALUES
('Ver Reportes', 'Permite acceder al módulo de reportes', 'reportes.ver_listado', 'reportes', 'ver_listado'),
('Exportar Productos', 'Permite exportar listado de productos a Excel', 'reportes.exportar_productos', 'reportes', 'exportar_productos'),
('Exportar Servicios', 'Permite exportar listado de servicios a Excel', 'reportes.exportar_servicios', 'reportes', 'exportar_servicios'),
('Exportar Turnos', 'Permite exportar listado de turnos a Excel', 'reportes.exportar_turnos', 'reportes', 'exportar_turnos'),
('Exportar Pedidos', 'Permite exportar listado de pedidos a Excel', 'reportes.exportar_pedidos', 'reportes', 'exportar_pedidos');

-- ========================================
-- FASE 2: Reportes Analíticos
-- ========================================

INSERT INTO permisos (nombre, descripcion, codigo, modulo, accion) VALUES
('Turnos por Día', 'Permite exportar análisis de turnos agrupados por día', 'reportes.turnos_por_dia', 'reportes', 'turnos_por_dia'),
('Turnos por Servicio', 'Permite exportar análisis de turnos agrupados por servicio', 'reportes.turnos_por_servicio', 'reportes', 'turnos_por_servicio'),
('Ingresos por Período', 'Permite exportar análisis de ingresos por período', 'reportes.ingresos_periodo', 'reportes', 'ingresos_periodo'),
('Unidades Vendidas', 'Permite exportar análisis de unidades vendidas por producto', 'reportes.unidades_vendidas', 'reportes', 'unidades_vendidas');

-- Asignar todos los permisos de reportes al rol Admin (id_rol = 1)
-- Ajustar el id_rol si el Admin tiene otro ID en tu base de datos
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT 1, id_permiso
FROM permisos
WHERE modulo = 'reportes'
AND NOT EXISTS (
    SELECT 1 FROM rol_permisos 
    WHERE id_rol = 1 AND rol_permisos.id_permiso = permisos.id_permiso
);

-- Verificar permisos creados
SELECT * FROM permisos WHERE modulo = 'reportes' ORDER BY accion;

-- Verificar asignación al rol Admin
SELECT r.nombre as rol, p.nombre as permiso, p.codigo
FROM rol_permisos rp
JOIN roles r ON r.id_rol = rp.id_rol
JOIN permisos p ON p.id_permiso = rp.id_permiso
WHERE p.modulo = 'reportes'
ORDER BY r.nombre, p.codigo;

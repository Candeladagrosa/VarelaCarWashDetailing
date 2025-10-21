-- Script para crear permisos del módulo de Reportes
-- Ejecutar en Supabase SQL Editor

-- Insertar permisos para el módulo de reportes
INSERT INTO permisos (nombre, descripcion, codigo, modulo, accion) VALUES
('Ver Reportes', 'Permite acceder al módulo de reportes', 'reportes.ver_listado', 'reportes', 'ver_listado'),
('Exportar Productos', 'Permite exportar listado de productos a Excel', 'reportes.exportar_productos', 'reportes', 'exportar_productos'),
('Exportar Servicios', 'Permite exportar listado de servicios a Excel', 'reportes.exportar_servicios', 'reportes', 'exportar_servicios'),
('Exportar Turnos', 'Permite exportar listado de turnos a Excel', 'reportes.exportar_turnos', 'reportes', 'exportar_turnos'),
('Exportar Pedidos', 'Permite exportar listado de pedidos a Excel', 'reportes.exportar_pedidos', 'reportes', 'exportar_pedidos');

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

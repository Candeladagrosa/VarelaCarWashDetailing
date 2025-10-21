-- ============================================
-- SEED DATA - Sistema RBAC
-- Datos iniciales de roles y permisos
-- ============================================

-- ============================================
-- INSERTAR ROLES
-- ============================================
INSERT INTO public.roles (id_rol, nombre, descripcion, es_sistema, activo) VALUES
(1, 'Administrador', 'Acceso completo a todas las funcionalidades del sistema', true, true),
(2, 'Vendedor', 'Puede gestionar turnos y pedidos, ver productos y servicios', true, true),
(3, 'Cliente', 'Puede realizar compras y reservar turnos', true, true)
ON CONFLICT (id_rol) DO NOTHING;

-- Resetear la secuencia para que los próximos roles tengan IDs correctos
SELECT setval('roles_id_rol_seq', (SELECT MAX(id_rol) FROM public.roles));

-- ============================================
-- INSERTAR PERMISOS
-- ============================================

-- Permisos de PRODUCTOS
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('productos.ver_listado', 'Ver Listado de Productos', 'Permite ver el listado de productos', 'productos', 'ver_listado'),
('productos.crear', 'Crear Productos', 'Permite crear nuevos productos', 'productos', 'crear'),
('productos.editar', 'Editar Productos', 'Permite editar productos existentes', 'productos', 'editar'),
('productos.eliminar', 'Eliminar Productos', 'Permite eliminar productos', 'productos', 'eliminar'),
('productos.cambiar_estado', 'Cambiar Estado de Productos', 'Permite activar/desactivar productos', 'productos', 'cambiar_estado')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de SERVICIOS
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('servicios.ver_listado', 'Ver Listado de Servicios', 'Permite ver el listado de servicios', 'servicios', 'ver_listado'),
('servicios.crear', 'Crear Servicios', 'Permite crear nuevos servicios', 'servicios', 'crear'),
('servicios.editar', 'Editar Servicios', 'Permite editar servicios existentes', 'servicios', 'editar'),
('servicios.eliminar', 'Eliminar Servicios', 'Permite eliminar servicios', 'servicios', 'eliminar'),
('servicios.cambiar_estado', 'Cambiar Estado de Servicios', 'Permite activar/desactivar servicios', 'servicios', 'cambiar_estado')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de USUARIOS
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('usuarios.ver_listado', 'Ver Listado de Usuarios', 'Permite ver el listado de usuarios', 'usuarios', 'ver_listado'),
('usuarios.crear', 'Crear Usuarios', 'Permite crear nuevos usuarios', 'usuarios', 'crear'),
('usuarios.editar', 'Editar Usuarios', 'Permite editar usuarios existentes', 'usuarios', 'editar'),
('usuarios.eliminar', 'Eliminar Usuarios', 'Permite eliminar usuarios', 'usuarios', 'eliminar'),
('usuarios.cambiar_rol', 'Cambiar Rol de Usuarios', 'Permite cambiar el rol de un usuario', 'usuarios', 'cambiar_rol'),
('usuarios.ver_detalles', 'Ver Detalles de Usuarios', 'Permite ver información detallada de usuarios', 'usuarios', 'ver_detalles')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de TURNOS
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('turnos.ver_listado', 'Ver Listado de Turnos', 'Permite ver el listado completo de turnos', 'turnos', 'ver_listado'),
('turnos.ver_propios', 'Ver Turnos Propios', 'Permite ver solo los turnos propios', 'turnos', 'ver_propios'),
('turnos.crear', 'Crear Turnos', 'Permite crear nuevos turnos', 'turnos', 'crear'),
('turnos.editar', 'Editar Turnos', 'Permite editar turnos existentes', 'turnos', 'editar'),
('turnos.eliminar', 'Eliminar Turnos', 'Permite eliminar turnos', 'turnos', 'eliminar'),
('turnos.cambiar_estado', 'Cambiar Estado de Turnos', 'Permite cambiar el estado de los turnos', 'turnos', 'cambiar_estado')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de PEDIDOS
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('pedidos.ver_listado', 'Ver Listado de Pedidos', 'Permite ver el listado completo de pedidos', 'pedidos', 'ver_listado'),
('pedidos.ver_propios', 'Ver Pedidos Propios', 'Permite ver solo los pedidos propios', 'pedidos', 'ver_propios'),
('pedidos.crear', 'Crear Pedidos', 'Permite crear nuevos pedidos', 'pedidos', 'crear'),
('pedidos.editar', 'Editar Pedidos', 'Permite editar pedidos existentes', 'pedidos', 'editar'),
('pedidos.eliminar', 'Eliminar Pedidos', 'Permite eliminar pedidos', 'pedidos', 'eliminar'),
('pedidos.cambiar_estado', 'Cambiar Estado de Pedidos', 'Permite cambiar el estado de los pedidos', 'pedidos', 'cambiar_estado')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de ROLES (ABM de roles)
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('roles.ver_listado', 'Ver Listado de Roles', 'Permite ver el listado de roles', 'roles', 'ver_listado'),
('roles.crear', 'Crear Roles', 'Permite crear nuevos roles', 'roles', 'crear'),
('roles.editar', 'Editar Roles', 'Permite editar roles existentes', 'roles', 'editar'),
('roles.eliminar', 'Eliminar Roles', 'Permite eliminar roles personalizados', 'roles', 'eliminar'),
('roles.asignar_permisos', 'Asignar Permisos a Roles', 'Permite asignar/remover permisos de roles', 'roles', 'asignar_permisos')
ON CONFLICT (codigo) DO NOTHING;

-- Permisos de AUDITORÍA
INSERT INTO public.permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('auditoria.ver_listado', 'Ver Auditoría', 'Permite ver el registro de auditoría del sistema', 'auditoria', 'ver_listado'),
('auditoria.ver_propia', 'Ver Auditoría Propia', 'Permite ver solo su propia auditoría', 'auditoria', 'ver_propia')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- ASIGNAR PERMISOS A ROLES
-- ============================================

-- ADMINISTRADOR - Tiene TODOS los permisos
INSERT INTO public.rol_permisos (id_rol, id_permiso)
SELECT 1, id_permiso FROM public.permisos
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- VENDEDOR - Permisos específicos
INSERT INTO public.rol_permisos (id_rol, id_permiso)
SELECT 2, id_permiso FROM public.permisos WHERE codigo IN (
    -- Productos: solo ver
    'productos.ver_listado',
    
    -- Servicios: solo ver
    'servicios.ver_listado',
    
    -- Turnos: ver todos, crear, editar y cambiar estado
    'turnos.ver_listado',
    'turnos.crear',
    'turnos.editar',
    'turnos.cambiar_estado',
    
    -- Pedidos: ver todos, crear, editar y cambiar estado
    'pedidos.ver_listado',
    'pedidos.crear',
    'pedidos.editar',
    'pedidos.cambiar_estado',
    
    -- Auditoría: ver propia
    'auditoria.ver_propia'
)
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- CLIENTE - Permisos básicos
INSERT INTO public.rol_permisos (id_rol, id_permiso)
SELECT 3, id_permiso FROM public.permisos WHERE codigo IN (
    -- Productos: ver
    'productos.ver_listado',
    
    -- Servicios: ver
    'servicios.ver_listado',
    
    -- Turnos: ver propios y crear
    'turnos.ver_propios',
    'turnos.crear',
    
    -- Pedidos: ver propios y crear
    'pedidos.ver_propios',
    'pedidos.crear',
    
    -- Auditoría: ver propia
    'auditoria.ver_propia'
)
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver roles creados
SELECT * FROM public.roles ORDER BY id_rol;

-- Ver cantidad de permisos por módulo
SELECT modulo, COUNT(*) as cantidad_permisos
FROM public.permisos
GROUP BY modulo
ORDER BY modulo;

-- Ver permisos asignados por rol
SELECT 
    r.nombre as rol,
    COUNT(rp.id_permiso) as cantidad_permisos
FROM public.roles r
LEFT JOIN public.rol_permisos rp ON r.id_rol = rp.id_rol
GROUP BY r.id_rol, r.nombre
ORDER BY r.id_rol;

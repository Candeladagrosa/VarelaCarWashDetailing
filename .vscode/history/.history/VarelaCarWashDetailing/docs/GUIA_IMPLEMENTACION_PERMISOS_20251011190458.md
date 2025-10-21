# Guía de Implementación - Permisos de Reportes

## Paso 1: Ejecutar Script SQL en Supabase

### Opción A: Desde el Dashboard de Supabase

1. Accede a tu proyecto en [https://supabase.com](https://supabase.com)
2. Ve a la sección **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo `sql/permisos_reportes.sql`
5. Haz clic en **Run** para ejecutar el script
6. Verifica que aparezca el mensaje de éxito

### Opción B: Verificación Manual

Si prefieres verificar o crear los permisos manualmente:

#### 1. Insertar Permisos

```sql
INSERT INTO permisos (nombre, descripcion, codigo, modulo, accion) VALUES
('Ver Reportes', 'Permite acceder al módulo de reportes', 'reportes.ver_listado', 'reportes', 'ver_listado'),
('Exportar Productos', 'Permite exportar listado de productos a Excel', 'reportes.exportar_productos', 'reportes', 'exportar_productos'),
('Exportar Servicios', 'Permite exportar listado de servicios a Excel', 'reportes.exportar_servicios', 'reportes', 'exportar_servicios'),
('Exportar Turnos', 'Permite exportar listado de turnos a Excel', 'reportes.exportar_turnos', 'reportes', 'exportar_turnos'),
('Exportar Pedidos', 'Permite exportar listado de pedidos a Excel', 'reportes.exportar_pedidos', 'reportes', 'exportar_pedidos');
```

#### 2. Verificar ID del Rol Admin

```sql
SELECT id_rol, nombre FROM roles WHERE nombre = 'Admin';
```

Anota el `id_rol` que aparezca (normalmente es 1).

#### 3. Asignar Permisos al Rol Admin

Si el id_rol es 1, usa este script:

```sql
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT 1, id_permiso
FROM permisos
WHERE modulo = 'reportes'
AND NOT EXISTS (
    SELECT 1 FROM rol_permisos 
    WHERE id_rol = 1 AND rol_permisos.id_permiso = permisos.id_permiso
);
```

Si el id_rol es diferente, reemplaza el `1` por el id correcto.

## Paso 2: Verificar Permisos Creados

Ejecuta esta consulta para verificar que se crearon correctamente:

```sql
SELECT * FROM permisos WHERE modulo = 'reportes' ORDER BY accion;
```

Deberías ver 5 permisos:
- reportes.ver_listado
- reportes.exportar_productos
- reportes.exportar_servicios
- reportes.exportar_turnos
- reportes.exportar_pedidos

## Paso 3: Verificar Asignación al Rol Admin

```sql
SELECT 
    r.nombre as rol, 
    p.nombre as permiso, 
    p.codigo
FROM rol_permisos rp
JOIN roles r ON r.id_rol = rp.id_rol
JOIN permisos p ON p.id_permiso = rp.id_permiso
WHERE p.modulo = 'reportes'
ORDER BY r.nombre, p.codigo;
```

Deberías ver 5 filas con todos los permisos asignados al rol Admin.

## Paso 4: Probar en la Aplicación

1. Cierra sesión y vuelve a iniciar sesión con un usuario Admin
2. Ve al Panel Administrativo
3. Deberías ver una nueva pestaña "Reportes" con icono de gráfico
4. Haz clic en ella para acceder al módulo
5. Intenta exportar cada uno de los 4 reportes

## Troubleshooting

### No veo la pestaña "Reportes"

1. Verifica que tu usuario tenga el rol Admin asignado:
```sql
SELECT u.email, r.nombre as rol
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
WHERE u.email = 'tu-email@example.com';
```

2. Verifica que el permiso esté asignado:
```sql
SELECT p.codigo
FROM rol_permisos rp
JOIN permisos p ON p.id_permiso = rp.id_permiso
WHERE rp.id_rol = (SELECT id_rol FROM usuarios WHERE email = 'tu-email@example.com')
AND p.modulo = 'reportes';
```

### Error al exportar

1. Abre la consola del navegador (F12)
2. Revisa los errores en la pestaña Console
3. Verifica que las tablas tengan datos:
```sql
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM servicios;
SELECT COUNT(*) FROM turnos;
SELECT COUNT(*) FROM pedidos;
```

### Los archivos no se descargan

1. Verifica que el navegador permita descargas automáticas
2. Revisa la configuración de pop-ups y descargas en tu navegador
3. Intenta con otro navegador

## Asignar Permisos a Otros Roles

Si deseas que otros roles (además de Admin) tengan acceso a reportes:

```sql
-- Ejemplo: Asignar solo ver reportes y exportar productos al rol "Gerente" (id_rol = 2)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT 2, id_permiso
FROM permisos
WHERE codigo IN ('reportes.ver_listado', 'reportes.exportar_productos')
AND NOT EXISTS (
    SELECT 1 FROM rol_permisos 
    WHERE id_rol = 2 AND rol_permisos.id_permiso = permisos.id_permiso
);
```

## Notas Importantes

- Los permisos se verifican en tiempo real usando `PermissionGuard`
- Si un usuario no tiene un permiso específico, el botón correspondiente no se mostrará
- Los archivos Excel se generan del lado del cliente (navegador)
- No se requiere configuración adicional en el servidor

## Soporte

Si tienes problemas, contacta al equipo de desarrollo con:
- Capturas de pantalla del error
- Logs de la consola del navegador
- Consultas SQL ejecutadas

# 🚀 Guía de Instalación del Sistema RBAC

## 📋 Resumen de Componentes Creados

### ✅ Base de Datos (3 archivos SQL)
- `database/rbac_schema.sql` - Esquema de tablas y RLS
- `database/rbac_seed.sql` - Datos iniciales (roles y permisos)
- `database/rbac_audit.sql` - Sistema de auditoría

### ✅ Hooks
- `src/hooks/usePermissions.js` - Hook para verificar permisos

### ✅ Componentes
- `src/components/PermissionGuard.jsx` - Protección de elementos UI
- `src/components/ProtectedRoute.jsx` - Protección de rutas
- `src/components/admin/RolesAdmin.jsx` - ABM de roles
- `src/components/admin/PermissionsAdmin.jsx` - Asignación de permisos

### ✅ Actualizaciones
- `src/contexts/SupabaseAuthContext.jsx` - Incluye profile, role, permissions
- `src/pages/AdminPanel.jsx` - Tabs protegidos + nuevos tabs de Roles y Permisos
- `src/App.jsx` - Usa ProtectedRoute para admin

---

## 🔧 Paso 1: Instalar Dependencias

Si no las tienes instaladas:

```bash
npm install prop-types
```

---

## 🗄️ Paso 2: Ejecutar Scripts SQL en Supabase

### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre el **SQL Editor** desde el menú lateral
3. Ejecuta los archivos **EN ESTE ORDEN**:

#### 2.1. Ejecutar `rbac_schema.sql`
```sql
-- Copia y pega TODO el contenido de database/rbac_schema.sql
-- Clic en "Run" o Ctrl+Enter
```

✅ **Verificar que se crearon las tablas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'permisos', 'rol_permisos', 'auditoria');
```
Deberías ver 4 filas.

#### 2.2. Ejecutar `add_rol_to_perfiles.sql` (⚠️ IMPORTANTE)
```sql
-- Copia y pega TODO el contenido de database/add_rol_to_perfiles.sql
-- Clic en "Run" o Ctrl+Enter
```

✅ **Verificar que se agregó la columna id_rol:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'perfiles'
AND column_name = 'id_rol';
```
Deberías ver la columna `id_rol` de tipo `integer`.

#### 2.3. Ejecutar `rbac_seed.sql`
```sql
-- Copia y pega TODO el contenido de database/rbac_seed.sql
-- Clic en "Run" o Ctrl+Enter
```

✅ **Verificar que se crearon los roles:**
```sql
SELECT * FROM public.roles ORDER BY id_rol;
```
Deberías ver 3 roles: Administrador, Vendedor, Cliente.

✅ **Verificar que se crearon los permisos:**
```sql
SELECT COUNT(*) as total FROM public.permisos;
```
Deberías ver aproximadamente 35 permisos.

✅ **Verificar asignaciones:**
```sql
SELECT 
    r.nombre as rol,
    COUNT(rp.id_permiso) as permisos_asignados
FROM public.roles r
LEFT JOIN public.rol_permisos rp ON r.id_rol = rp.id_rol
GROUP BY r.id_rol, r.nombre
ORDER BY r.id_rol;
```
Deberías ver:
- Administrador: ~35 permisos
- Vendedor: ~9 permisos
- Cliente: ~6 permisos

#### 2.4. Ejecutar `rbac_audit.sql`
```sql
-- Copia y pega TODO el contenido de database/rbac_audit.sql
-- Clic en "Run" o Ctrl+Enter
```

✅ **Verificar funciones creadas:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_permissions', 'user_has_permission', 'audit_trigger_func');
```
Deberías ver 3 funciones.

---

## 👥 Paso 3: Actualizar Usuarios Existentes

Si ya tienes usuarios en la tabla `perfiles`, asigna roles:

```sql
-- Asignar rol Cliente a todos los usuarios que no tienen rol
UPDATE public.perfiles 
SET id_rol = 3 
WHERE id_rol IS NULL;

-- Verificar
SELECT 
    p.nombre,
    p.apellido,
    p.email,
    r.nombre as rol
FROM public.perfiles p
LEFT JOIN public.roles r ON p.id_rol = r.id_rol;
```

### Asignar rol Administrador a tu usuario

```sql
-- Reemplaza 'tu-email@example.com' con tu email real
UPDATE public.perfiles 
SET id_rol = 1 
WHERE email = 'tu-email@example.com';
```

---

## 🧪 Paso 4: Verificar en la Aplicación

1. **Reinicia el servidor de desarrollo** (si estaba corriendo):
```bash
# Detén el servidor (Ctrl+C) y reinicia
npm run dev
```

2. **Inicia sesión** con tu usuario administrador

3. **Verifica que veas el Panel Admin completo** con todos los tabs:
   - Productos
   - Servicios
   - Usuarios
   - Turnos
   - Pedidos
   - **Roles** (nuevo)
   - **Permisos** (nuevo)

4. **Prueba crear un nuevo rol**:
   - Ve a la tab "Roles"
   - Clic en "Nuevo Rol"
   - Crea un rol de prueba (ej: "Supervisor")

5. **Prueba asignar permisos**:
   - Ve a la tab "Permisos"
   - Selecciona un rol
   - Marca/desmarca permisos
   - Clic en "Guardar Cambios"

---

## 🔍 Paso 5: Probar con Diferentes Roles

### Crear un usuario Vendedor

1. Crea un nuevo usuario desde la página de registro
2. En Supabase SQL Editor, asigna el rol Vendedor:

```sql
-- Reemplaza 'vendedor@example.com' con el email del usuario
UPDATE public.perfiles 
SET id_rol = 2 
WHERE email = 'vendedor@example.com';
```

3. Cierra sesión e inicia con ese usuario
4. **Verificar que:**
   - ✅ Ve el Panel Admin
   - ✅ Ve tabs: Turnos, Pedidos
   - ❌ NO ve tabs: Productos (solo lectura), Servicios (solo lectura), Usuarios, Roles, Permisos

### Crear un usuario Cliente

1. Crea otro usuario desde registro (o ya tiene rol Cliente por defecto)
2. Cierra sesión e inicia con ese usuario
3. **Verificar que:**
   - ❌ NO puede acceder a `/admin`
   - ✅ Ve mensaje de "Acceso Denegado" si intenta entrar

---

## ⚠️ Troubleshooting

### Error: "función get_user_permissions no existe"
**Solución:** Ejecuta nuevamente el archivo `rbac_audit.sql`

### Error: "rol_permisos no existe"
**Solución:** Ejecuta nuevamente el archivo `rbac_schema.sql`

### No veo los tabs de Roles/Permisos en el Admin
**Solución:** Verifica que tu usuario tenga el rol Administrador (id_rol = 1)

### Los permisos no se cargan
**Solución:** 
1. Abre la consola del navegador (F12)
2. Busca errores relacionados con `get_user_permissions`
3. Verifica que las políticas RLS estén habilitadas:

```sql
-- Verificar RLS en tabla permisos
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('roles', 'permisos', 'rol_permisos', 'auditoria');
```

Todas deberían tener `rowsecurity = true`.

### Error al guardar permisos
**Solución:** Verifica que el usuario tenga el permiso `roles.asignar_permisos`:

```sql
-- Reemplaza 'user-uuid' con tu UUID real
SELECT * FROM public.get_user_permissions('user-uuid');
```

---

## 🎯 Próximos Pasos Opcionales

Una vez que el sistema RBAC esté funcionando:

1. **Proteger componentes existentes** - Agregar `PermissionGuard` a botones de crear/editar/eliminar
2. **Crear página de historial** - Para que clientes vean sus turnos y pedidos
3. **Configurar auditoría avanzada** - Agregar triggers adicionales
4. **Personalizar permisos** - Crear roles y permisos según tus necesidades

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs de Supabase (Dashboard > Logs)
2. Revisa la consola del navegador (F12 > Console)
3. Verifica que ejecutaste los 3 archivos SQL en orden
4. Verifica que tu usuario tenga un rol asignado

---

## ✅ Checklist Final

- [ ] Ejecutado `rbac_schema.sql` en Supabase
- [ ] Ejecutado `rbac_seed.sql` en Supabase
- [ ] Ejecutado `rbac_audit.sql` en Supabase
- [ ] Verificado que se crearon 4 tablas
- [ ] Verificado que se crearon 3 roles
- [ ] Verificado que se crearon ~35 permisos
- [ ] Asignado rol Administrador a mi usuario
- [ ] Reiniciado el servidor de desarrollo
- [ ] Probado acceso al Panel Admin
- [ ] Visto las tabs de Roles y Permisos
- [ ] Creado un rol de prueba
- [ ] Asignado permisos a un rol
- [ ] Probado con un usuario Vendedor
- [ ] Probado con un usuario Cliente

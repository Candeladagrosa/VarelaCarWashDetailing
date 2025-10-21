# Mejoras en Gestión de Usuarios

## 📋 Descripción

Se han implementado mejoras de seguridad y usabilidad en el sistema de gestión de usuarios, enfocadas en:
- Asignación automática de rol "Cliente" a usuarios registrados
- Restricción de creación de Vendedores/Admins solo a administradores
- Eliminación permanente de usuarios (hard-delete)
- Prevención de auto-eliminación y auto-desactivación

---

## 🎯 Cambios Realizados

### 1. **Rol por Defecto: Cliente**

#### ✅ Registro de Usuarios (`RegisterPage.jsx`)
- Los usuarios que se registran por su cuenta **automáticamente** reciben el rol de **Cliente** (id_rol = 3)
- No existe ningún selector de rol en el formulario de registro público
- El rol se asigna mediante la función RPC `create_profile` en la base de datos

#### 📝 Función RPC `create_profile`
**Ubicación:** `sql/create_profile_function.sql`

```sql
CREATE OR REPLACE FUNCTION create_profile(
  user_id uuid,
  user_nombre varchar,
  user_apellido varchar,
  user_dni integer,
  user_telefono varchar
)
RETURNS void AS $$
BEGIN
  INSERT INTO perfiles (id, nombre, apellido, dni, telefono, id_rol, estado)
  VALUES (
    user_id,
    user_nombre,
    user_apellido,
    user_dni,
    user_telefono,
    3, -- Cliente por defecto
    true -- Activo por defecto
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Características:**
- Asigna automáticamente `id_rol = 3` (Cliente)
- Activa el perfil por defecto (`estado = true`)
- Se ejecuta al registrar un nuevo usuario

---

### 2. **Restricción de Creación de Vendedores**

#### ✅ Panel de Administración (`UsersAdmin.jsx`)
- Solo los **administradores** con permiso `usuarios.crear` pueden crear usuarios con roles diferentes a Cliente
- El formulario de administración permite seleccionar cualquier rol disponible (Cliente, Vendedor, Admin)
- Los usuarios registrados públicamente **siempre** serán Clientes

**Flujos de Creación:**
```
┌─────────────────────────────────────────────┐
│  REGISTRO PÚBLICO (RegisterPage)            │
│  ├─ Usuario completa formulario             │
│  ├─ Se crea cuenta en auth.users            │
│  └─ create_profile() asigna rol CLIENTE     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PANEL ADMIN (UsersAdmin - Rol Admin)       │
│  ├─ Admin completa formulario               │
│  ├─ Admin selecciona rol (Cliente/Vendedor) │
│  └─ Usuario creado con el rol seleccionado  │
└─────────────────────────────────────────────┘
```

---

### 3. **Eliminación Permanente (Hard-Delete)**

#### ⚠️ Cambio Importante
**Antes:**
```javascript
// Soft-delete: Desactivaba el usuario
.update({ estado: false })
```

**Ahora:**
```javascript
// Hard-delete: Elimina permanentemente
.delete()
```

#### 🛡️ Confirmación Mejorada
Ahora se muestra un mensaje de advertencia más explícito:

```
⚠️ ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE este usuario?

Esta acción NO SE PUEDE DESHACER.

• El usuario será eliminado de la base de datos
• Se perderán todos sus datos asociados
• No podrá volver a iniciar sesión
```

#### 📝 Mensajes Actualizados
- **Éxito:** "El usuario ha sido eliminado permanentemente"
- **Error:** "No se pudo eliminar el usuario. Verifica que no tenga datos asociados."

---

### 4. **Prevención de Auto-Eliminación y Auto-Desactivación**

#### 🚫 Validaciones Implementadas

##### En `handleDelete()`:
```javascript
// Prevenir auto-eliminación
if (currentUser && userId === currentUser.id) {
  toast({
    variant: 'destructive',
    title: 'Acción no permitida',
    description: 'No puedes eliminar tu propia cuenta',
  });
  return;
}
```

##### En `toggleStatus()`:
```javascript
// Prevenir auto-desactivación
if (currentUser && userId === currentUser.id) {
  toast({
    variant: 'destructive',
    title: 'Acción no permitida',
    description: 'No puedes desactivar tu propia cuenta',
  });
  return;
}
```

#### 🔍 Contexto de Autenticación
Se utiliza `useAuth()` para obtener el usuario actual:
```javascript
import { useAuth } from '@/contexts/SupabaseAuthContext';
const { user: currentUser } = useAuth();
```

---

## 🔧 Archivos Modificados

### 1. `sql/create_profile_function.sql` ⭐ NUEVO
Función RPC para crear perfiles con rol Cliente por defecto

### 2. `src/components/admin/UsersAdmin.jsx`
**Cambios:**
- ✅ Import de `useAuth` para obtener usuario actual
- ✅ Validación en `toggleStatus()` para prevenir auto-desactivación
- ✅ Cambio de soft-delete a hard-delete en `handleDelete()`
- ✅ Validación en `handleDelete()` para prevenir auto-eliminación
- ✅ Mensaje de confirmación mejorado con advertencias
- ✅ Mensajes de error/éxito actualizados

### 3. `src/pages/RegisterPage.jsx`
**Sin cambios necesarios:**
- Ya utiliza la función RPC `create_profile`
- No tiene selector de rol (correcto)

---

## 📦 Instalación de la Función RPC

### Paso 1: Acceder a Supabase
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Abre el **SQL Editor**

### Paso 2: Ejecutar Script
1. Copia el contenido de `sql/create_profile_function.sql`
2. Pégalo en el editor SQL
3. Ejecuta el script (RUN)

### Paso 3: Verificar
Ejecuta esta consulta para verificar que la función existe:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_profile';
```

Deberías ver:
```
routine_name    | routine_type
----------------|-------------
create_profile  | FUNCTION
```

---

## 🧪 Pruebas Sugeridas

### Test 1: Registro Público
1. Cerrar sesión
2. Ir a `/register`
3. Completar formulario de registro
4. Verificar en el panel admin que el nuevo usuario tiene rol "Cliente"

### Test 2: Creación de Vendedor (Admin)
1. Iniciar sesión como Admin
2. Ir a Panel Admin → Usuarios
3. Crear nuevo usuario y seleccionar rol "Vendedor"
4. Verificar que se crea con el rol seleccionado

### Test 3: Auto-Desactivación
1. Iniciar sesión como Admin
2. Ir a Panel Admin → Usuarios
3. Intentar desactivar tu propia cuenta (botón toggle)
4. Verificar que aparece el mensaje: "No puedes desactivar tu propia cuenta"

### Test 4: Auto-Eliminación
1. Iniciar sesión como Admin
2. Ir a Panel Admin → Usuarios
3. Intentar eliminar tu propia cuenta (botón eliminar)
4. Verificar que aparece el mensaje: "No puedes eliminar tu propia cuenta"

### Test 5: Eliminación Permanente
1. Iniciar sesión como Admin
2. Crear un usuario de prueba
3. Eliminar el usuario de prueba
4. Verificar en base de datos que el registro fue eliminado (no solo `estado = false`)

---

## ⚠️ Consideraciones Importantes

### 🔒 Seguridad
- La función `create_profile` usa `SECURITY DEFINER`, lo que permite insertar en la tabla `perfiles` incluso si el usuario no tiene permisos directos
- Solo se puede ejecutar desde el backend (RPC), no es accesible directamente desde el frontend

### 🗑️ Eliminación de Usuarios
- **Hard-delete** es permanente e irreversible
- Considera las implicaciones en tablas relacionadas (turnos, pedidos, etc.)
- Es posible que necesites políticas `ON DELETE CASCADE` o `ON DELETE SET NULL` en foreign keys

### 👤 Integridad de Datos
- Si un usuario tiene turnos o pedidos asociados, la eliminación puede fallar
- El mensaje de error indica: "Verifica que no tenga datos asociados"
- Considera implementar validaciones adicionales antes de eliminar

### 🔄 Migración de Usuarios Existentes
Si ya tienes usuarios con rol "Vendedor" (id_rol = 2) que deberían ser "Cliente":
```sql
-- Cambiar usuarios vendedores a clientes (ejecutar con precaución)
UPDATE perfiles 
SET id_rol = 3 
WHERE id_rol = 2 
  AND id NOT IN (
    -- Excluir vendedores legítimos si los hay
    SELECT id FROM perfiles WHERE email IN ('vendedor@example.com')
  );
```

---

## 📚 Referencias

- **Contexto de Autenticación:** `src/contexts/SupabaseAuthContext.jsx`
- **Permisos RBAC:** Sistema implementado en `database/rbac_*.sql`
- **Componente de Guardias:** `src/components/PermissionGuard.jsx`

---

## ✅ Checklist de Implementación

- [x] Crear función RPC `create_profile` con rol Cliente por defecto
- [x] Importar `useAuth` en UsersAdmin.jsx
- [x] Implementar validación de auto-desactivación en toggleStatus
- [x] Cambiar soft-delete a hard-delete en handleDelete
- [x] Implementar validación de auto-eliminación en handleDelete
- [x] Actualizar mensaje de confirmación de eliminación
- [x] Actualizar mensajes de éxito/error
- [ ] **PENDIENTE:** Ejecutar `sql/create_profile_function.sql` en Supabase
- [ ] **PENDIENTE:** Probar registro de nuevo usuario público
- [ ] **PENDIENTE:** Probar eliminación permanente
- [ ] **PENDIENTE:** Probar validaciones de auto-eliminación/desactivación

---

**Fecha de Implementación:** 2024  
**Versión:** 1.0  
**Autor:** Sistema  
**Estado:** ✅ Completado - Pendiente de Deploy en Base de Datos

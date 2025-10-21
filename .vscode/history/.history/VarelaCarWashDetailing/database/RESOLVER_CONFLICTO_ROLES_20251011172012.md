# 🔧 Guía de Resolución: Conflicto entre tablas 'rol' y 'roles'

## 🔍 Problema Identificado

Existen dos tablas en la base de datos que hacen referencia a roles:
- `rol` (tabla vieja, probablemente ya existente)
- `roles` (tabla nueva, creada por el sistema RBAC)

Esto causa conflictos y errores en la aplicación.

## 📊 Paso 1: Diagnosticar el Conflicto

Antes de tomar cualquier decisión, ejecuta el script de diagnóstico en Supabase:

**Archivo:** `database/diagnose_roles_conflict.sql`

Este script te mostrará:
- ✅ Qué tablas existen realmente
- ✅ Estructura de cada tabla
- ✅ Datos en cada tabla
- ✅ Qué otras tablas hacen referencia a ellas

```sql
-- Ejecuta TODO el contenido del archivo en SQL Editor
```

## 🎯 Paso 2: Decidir qué Opción Usar

Basándote en los resultados del diagnóstico, elige una opción:

### ✅ Opción 1: Migrar a 'roles' (RECOMENDADO)

**Usa esta opción si:**
- La tabla `rol` es vieja y tiene pocos datos
- Prefieres usar la nueva estructura del sistema RBAC
- Quieres aprovechar todas las funcionalidades (auditoría, permisos granulares, etc.)

**Script:** `database/migrate_rol_to_roles.sql`

**Pasos:**
1. Abre el archivo `migrate_rol_to_roles.sql`
2. **IMPORTANTE:** Revisa la sección comentada del INSERT (línea ~50)
3. Si hay datos valiosos en `rol`, descomenta y ajusta el INSERT
4. Ejecuta el script completo en SQL Editor de Supabase
5. Verifica que los datos se migraron correctamente
6. **No es necesario cambiar código** - ya está preparado para usar `roles`

### ✅ Opción 2: Mantener 'rol' y renombrar

**Usa esta opción si:**
- La tabla `rol` tiene muchos datos importantes
- Otras partes del sistema dependen de `rol`
- Prefieres no perder ningún dato existente

**Script:** `database/migrate_roles_to_rol.sql`

**Pasos:**
1. Ejecuta el script `migrate_roles_to_rol.sql` en SQL Editor
2. Esto renombrará `rol` → `roles` y ajustará la estructura
3. **No es necesario cambiar código** - se mantiene el nombre `roles`

## 📝 Paso 3: Ejecutar el Script de Migración

### Si elegiste Opción 1:

```sql
-- En SQL Editor de Supabase, ejecuta:
-- Contenido completo de database/migrate_rol_to_roles.sql
```

### Si elegiste Opción 2:

```sql
-- En SQL Editor de Supabase, ejecuta:
-- Contenido completo de database/migrate_roles_to_rol.sql
```

## ✅ Paso 4: Verificar la Migración

Después de ejecutar el script elegido, verifica:

```sql
-- 1. Verificar que solo existe la tabla 'roles'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rol', 'roles');
-- Deberías ver solo 'roles'

-- 2. Verificar estructura de 'roles'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roles' 
ORDER BY ordinal_position;

-- 3. Verificar que perfiles apunta correctamente a roles
SELECT 
    p.nombre,
    p.apellido,
    p.id_rol,
    r.nombre as rol
FROM public.perfiles p
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
LIMIT 5;

-- 4. Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'perfiles'
AND ccu.table_name = 'roles';
```

## 🚀 Paso 5: Continuar con la Instalación RBAC

Después de resolver el conflicto, continúa con los pasos normales:

1. ✅ Ejecutar `database/add_rol_to_perfiles.sql` (si aún no lo hiciste)
2. ✅ Ejecutar `database/rbac_seed.sql`
3. ✅ Ejecutar `database/rbac_audit.sql`
4. ✅ Asignar rol administrador a tu usuario
5. ✅ Recargar la aplicación

## ⚠️ Notas Importantes

### Si tuviste errores:

1. **Error: "relation 'rol' does not exist"**
   - Significa que ya solo tienes `roles`, puedes continuar normal

2. **Error: "duplicate key value violates unique constraint"**
   - Ya tienes datos en `roles`, revisa si necesitas migrar algo de `rol`

3. **Error: "foreign key constraint"**
   - Hay otras tablas apuntando a `rol`, ejecuta el diagnóstico para verlas

### Respaldo de Seguridad:

Antes de ejecutar cualquier migración, puedes hacer un respaldo:

```sql
-- Respaldar tabla rol (si existe)
CREATE TABLE rol_backup AS SELECT * FROM public.rol;

-- Respaldar tabla roles (si existe)
CREATE TABLE roles_backup AS SELECT * FROM public.roles;
```

## 📞 Si algo sale mal:

1. Revisa los errores en la consola de SQL Editor
2. Verifica que ejecutaste el diagnóstico primero
3. Asegúrate de haber elegido la opción correcta según tus datos
4. Si perdiste datos, puedes restaurar desde los backups

---

## ✅ Checklist Final

- [ ] Ejecuté `diagnose_roles_conflict.sql`
- [ ] Revisé los resultados del diagnóstico
- [ ] Elegí la opción correcta (1 o 2)
- [ ] Hice respaldo de las tablas (opcional pero recomendado)
- [ ] Ejecuté el script de migración correspondiente
- [ ] Verifiqué que solo existe la tabla `roles`
- [ ] Verifiqué que `perfiles.id_rol` apunta a `roles.id_rol`
- [ ] Continué con la instalación RBAC normal

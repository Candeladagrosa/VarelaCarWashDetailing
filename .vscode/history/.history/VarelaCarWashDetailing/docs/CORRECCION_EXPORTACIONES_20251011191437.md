# Corrección de Exportaciones de Turnos y Pedidos

## Problema Identificado

Las exportaciones de Turnos y Pedidos estaban fallando porque las queries de Supabase en el componente `ReportesAdmin.jsx` no coincidían con la estructura real de las tablas en la base de datos.

## Cambios Realizados

### 1. Corrección en `exportUtils.js`

#### Función `formatTurnosParaExcel()`

**Antes:**
```javascript
// Esperaba: usuarios.nombre_completo, usuarios.email
// Usaba: fecha_hora (campo que no existe)
```

**Después:**
```javascript
// Ahora usa: perfiles.nombre, perfiles.apellido, perfiles.dni, perfiles.telefono
// Usa: fecha (separada) y hora (separada)
```

**Campos exportados:**
- ID
- Cliente (nombre + apellido del perfil)
- DNI
- Teléfono
- Servicio
- Fecha (formato argentino)
- Hora
- Estado
- Notas
- Fecha Creación

#### Función `formatPedidosParaExcel()`

**Antes:**
```javascript
// Esperaba: usuarios.nombre_completo, usuarios.email
// Esperaba: pedido_detalles
```

**Después:**
```javascript
// Ahora usa: cliente_data (JSON con info del cliente)
// Usa: pedido_productos (con join a productos)
```

**Campos exportados:**
- ID
- Cliente (nombre + apellido de cliente_data)
- Email
- DNI
- Teléfono
- Total
- Estado Pago
- Estado Envío
- Fecha Pedido
- Cantidad Items (calculada)
- Productos (lista concatenada con cantidades)
- Fecha Creación

### 2. Corrección en `ReportesAdmin.jsx`

#### Query de Turnos

**Antes:**
```javascript
.select(`
  *,
  usuarios:id_usuario(nombre_completo, email),
  servicios:id_servicio(nombre, precio)
`)
.order('fecha_hora', { ascending: false });
```

**Después (Versión Final):**
```javascript
// 1. Cargar turnos con servicios
const { data: turnosData } = await supabase
  .from('turnos')
  .select(`
    *,
    servicios (nombre, precio)
  `)
  .order('created_at', { ascending: false });

// 2. Obtener IDs únicos de clientes
const clienteIds = [...new Set(turnosData.map(t => t.id_cliente).filter(Boolean))];

// 3. Cargar perfiles por separado
const { data: perfilesData } = await supabase
  .from('perfiles')
  .select('id, nombre, apellido, dni, telefono')
  .in('id', clienteIds);

// 4. Crear mapa de perfiles y combinar con turnos
```

**Razón:** La tabla `perfiles` no permite JOIN directo desde `turnos`, por lo que se debe cargar por separado y combinar manualmente, exactamente como lo hace `TurnosAdmin.jsx`.

#### Query de Pedidos

**Antes:**
```javascript
.select(`
  *,
  usuarios:id_usuario(nombre_completo, email),
  pedido_detalles(*)
`)
.order('fecha_pedido', { ascending: false });
```

**Después:**
```javascript
.select(`
  *,
  pedido_productos (
    id_pedido_producto,
    id_producto,
    cantidad,
    precio,
    productos (
      nombre
    )
  )
`)
.order('created_at', { ascending: false });
```

## Estructura de Base de Datos Identificada

### Tabla `turnos`
- Campos principales: `id_turno`, `fecha`, `hora`, `estado`, `notas`, `created_at`
- Foreign Keys:
  - `id_cliente` → tabla `perfiles` (nombre, apellido, dni, telefono)
  - `id_servicio` → tabla `servicios` (nombre, precio)

### Tabla `pedidos`
- Campos principales: `id_pedido`, `total`, `estado_pago`, `estado_envio`, `fecha_pedido`, `created_at`
- Campo JSON: `cliente_data` (contiene nombre, apellido, email, dni, telefono)
- Relación: `pedido_productos` (many-to-many con productos)

### Tabla `pedido_productos`
- Campos: `id_pedido_producto`, `id_producto`, `cantidad`, `precio`
- Foreign Keys:
  - `id_producto` → tabla `productos` (nombre)

## Manejo de Errores Mejorado

Ambas funciones ahora incluyen:

1. **Validación de datos nulos:**
   ```javascript
   const perfil = turno.perfiles;
   const clienteData = pedido.cliente_data;
   ```

2. **Valores por defecto:**
   ```javascript
   'Cliente': perfil ? `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim() : 'N/A',
   'DNI': perfil?.dni || 'N/A',
   ```

3. **Formateo seguro de fechas:**
   ```javascript
   'Fecha': turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-AR') : 'N/A',
   ```

4. **Cálculos seguros:**
   ```javascript
   const cantidadItems = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
   ```

## Pruebas Recomendadas

1. **Exportar Turnos:**
   - Verificar que aparezcan todos los campos
   - Confirmar formato de fecha argentino (DD/MM/AAAA)
   - Validar que la hora se muestre correctamente

2. **Exportar Pedidos:**
   - Verificar que se calculen correctamente las cantidades
   - Confirmar que la lista de productos se muestre completa
   - Validar estados de pago y envío

3. **Casos especiales:**
   - Turnos sin cliente asignado
   - Pedidos sin productos
   - Campos opcionales vacíos (notas, teléfono, etc.)

## Compatibilidad

✅ Los cambios son compatibles con:
- Las exportaciones de Productos y Servicios (no fueron modificadas)
- El resto del sistema (TurnosAdmin, PedidosAdmin)
- La estructura actual de permisos

## Archivos Modificados

1. `src/lib/exportUtils.js`
   - `formatTurnosParaExcel()` - Completamente reescrita
   - `formatPedidosParaExcel()` - Completamente reescrita

2. `src/components/admin/ReportesAdmin.jsx`
   - `exportarTurnos()` - Query corregida
   - `exportarPedidos()` - Query corregida

## Próximos Pasos

Una vez aplicados estos cambios:

1. Ejecutar el script SQL de permisos (si no lo hiciste aún)
2. Reiniciar el servidor de desarrollo
3. Probar las 4 exportaciones:
   - ✅ Productos (funcionaba)
   - ✅ Servicios (funcionaba)
   - ✅ Turnos (corregido)
   - ✅ Pedidos (corregido)

## Notas Técnicas

- Se usa `optional chaining` (?.) para evitar errores con datos nulos
- Se usa `trim()` para eliminar espacios en blanco extra
- Se usa `reduce()` para calcular totales de forma segura
- Formato de fecha argentino: `es-AR`
- Todas las exportaciones usan el mismo patrón de manejo de errores

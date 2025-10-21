# Reportes Analíticos - Fase 2

## Descripción

Reportes avanzados con análisis de datos agregados, estadísticas y métricas de negocio para la toma de decisiones estratégicas.

## Nuevos Reportes Implementados

### 1. 📅 Turnos por Día

**Descripción:** Análisis de la distribución de turnos a lo largo del tiempo (últimos 30 días).

**Información incluida:**
- Fecha y día de la semana
- Cantidad total de turnos
- Turnos por estado (Confirmados, Pendientes, Realizados, Cancelados)
- Ingresos estimados del día
- Tasa de ocupación (%)

**Casos de uso:**
- Identificar días con mayor demanda
- Detectar patrones semanales
- Planificar capacidad y recursos
- Optimizar horarios de atención

**Período analizado:** Últimos 30 días

**Permiso requerido:** `reportes.turnos_por_dia`

---

### 2. 🔧 Turnos por Servicio

**Descripción:** Análisis de popularidad y rendimiento por tipo de servicio.

**Información incluida:**
- Nombre del servicio
- Cantidad y porcentaje de turnos
- Turnos por estado
- Precio del servicio
- Ingresos totales generados
- Promedio de turnos diarios

**Casos de uso:**
- Identificar servicios más demandados
- Optimizar oferta de servicios
- Detectar servicios con baja demanda
- Ajustar precios basados en demanda
- Planificar promociones

**Período analizado:** Todos los registros históricos

**Permiso requerido:** `reportes.turnos_por_servicio`

---

### 3. 💰 Ingresos por Período

**Descripción:** Análisis financiero completo con ingresos de servicios y productos.

**Información incluida:**

**Resumen General:**
- Período analizado
- Total de ingresos
- Ingresos por servicios
- Ingresos por productos
- Cantidad de turnos y pedidos
- Ticket promedio

**Por Día:**
- Fecha y día de la semana
- Total de ingresos
- Desglose: servicios vs productos
- Cantidad de transacciones

**Por Mes:**
- Mes y año
- Total de ingresos
- Desglose: servicios vs productos
- Crecimiento vs mes anterior (%)

**Casos de uso:**
- Monitorear salud financiera
- Identificar tendencias de ingresos
- Comparar períodos
- Detectar estacionalidad
- Proyectar ingresos futuros
- Tomar decisiones de inversión

**Período analizado:** Todos los registros con ingresos confirmados

**Permiso requerido:** `reportes.ingresos_periodo`

---

### 4. 📦 Unidades Vendidas por Producto (Mes Actual)

**Descripción:** Ranking de productos más vendidos del mes con análisis de inventario.

**Información incluida:**
- Ranking del producto
- Nombre del producto
- Unidades vendidas
- Porcentaje del total
- Precio actual
- Ingresos totales generados
- Stock actual
- Estado de stock (Sin Stock, Bajo, Normal, Exceso)
- Promedio de ventas diarias
- Tendencia (Alta Demanda, Estable, Baja Demanda)

**Casos de uso:**
- Gestión de inventario
- Identificar productos estrella
- Detectar productos con bajo stock
- Planificar compras
- Optimizar capital de trabajo
- Decidir qué productos promocionar o descontinuar

**Período analizado:** Mes actual (desde el día 1 hasta hoy)

**Permiso requerido:** `reportes.unidades_vendidas`

---

## Permisos Necesarios

Ejecuta el script SQL actualizado en Supabase:

```sql
-- FASE 2: Reportes Analíticos
INSERT INTO permisos (nombre, descripcion, codigo, modulo, accion) VALUES
('Turnos por Día', 'Permite exportar análisis de turnos agrupados por día', 'reportes.turnos_por_dia', 'reportes', 'turnos_por_dia'),
('Turnos por Servicio', 'Permite exportar análisis de turnos agrupados por servicio', 'reportes.turnos_por_servicio', 'reportes', 'turnos_por_servicio'),
('Ingresos por Período', 'Permite exportar análisis de ingresos por período', 'reportes.ingresos_periodo', 'reportes', 'ingresos_periodo'),
('Unidades Vendidas', 'Permite exportar análisis de unidades vendidas por producto', 'reportes.unidades_vendidas', 'reportes', 'unidades_vendidas');

-- Asignar al rol Admin
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT 1, id_permiso
FROM permisos
WHERE codigo IN (
  'reportes.turnos_por_dia',
  'reportes.turnos_por_servicio',
  'reportes.ingresos_periodo',
  'reportes.unidades_vendidas'
)
AND NOT EXISTS (
    SELECT 1 FROM rol_permisos 
    WHERE id_rol = 1 AND rol_permisos.id_permiso = permisos.id_permiso
);
```

## Características Técnicas

### Cálculos Implementados

**Turnos por Día:**
- Tasa de ocupación = (Total turnos del día / Capacidad máxima) × 100
- Capacidad máxima configurada: 10 turnos/día

**Turnos por Servicio:**
- Porcentaje = (Turnos del servicio / Total turnos) × 100
- Promedio diario = Turnos del servicio / Días del período

**Ingresos:**
- Ticket promedio = Total ingresos / (Total turnos + Total pedidos)
- Crecimiento mensual = ((Mes actual - Mes anterior) / Mes anterior) × 100
- Solo se cuentan turnos "Realizados" y pedidos "Pagados"

**Unidades Vendidas:**
- Porcentaje = (Unidades producto / Total unidades) × 100
- Promedio diario = Unidades vendidas / Días del mes
- Estado de stock:
  - **Sin Stock**: stock = 0
  - **Bajo**: stock < 50% de unidades vendidas
  - **Normal**: stock entre 50% y 300% de unidades vendidas
  - **Exceso**: stock > 300% de unidades vendidas
- Tendencia:
  - **Alta Demanda**: > 15% del total
  - **Baja Demanda**: < 5% del total
  - **Estable**: entre 5% y 15%

### Formato de Archivos

Todos los reportes se exportan en formato Excel (.xlsx) con:
- Columnas autoajustadas
- Fechas en formato argentino (DD/MM/AAAA)
- Números con separador de miles
- Ordenamiento lógico de datos

## Interfaz de Usuario

Los reportes están organizados en dos secciones:

### 📊 Exportaciones Básicas
- Productos
- Servicios
- Turnos
- Pedidos

### 📈 Reportes Analíticos (NUEVO)
- Turnos por Día (color índigo)
- Turnos por Servicio (color cyan)
- Ingresos por Período (color esmeralda)
- Unidades Vendidas (color rosa)

## Ejemplos de Uso

### Escenario 1: Optimizar Horarios
1. Exportar "Turnos por Día"
2. Identificar días con mayor ocupación
3. Agregar más horarios en días de alta demanda
4. Redistribuir recursos según patrones

### Escenario 2: Gestión de Inventario
1. Exportar "Unidades Vendidas"
2. Identificar productos con estado "Bajo" o "Sin Stock"
3. Ordenar productos según tendencia "Alta Demanda"
4. Realizar compras estratégicas

### Escenario 3: Análisis Financiero
1. Exportar "Ingresos por Período"
2. Revisar crecimiento mes a mes
3. Identificar meses de alta/baja facturación
4. Planificar promociones en meses bajos

### Escenario 4: Optimizar Servicios
1. Exportar "Turnos por Servicio"
2. Identificar servicios con bajo porcentaje
3. Analizar rentabilidad (ingresos vs demanda)
4. Decidir ajustes de precio o descontinuación

## Archivos Modificados

### Nuevos Archivos:
- `docs/REPORTES_FASE2_README.md` - Esta documentación

### Archivos Actualizados:
- `src/lib/exportUtils.js` - 4 nuevas funciones de formateo
- `src/components/admin/ReportesAdmin.jsx` - 4 nuevas funciones de exportación
- `sql/permisos_reportes.sql` - 4 nuevos permisos

## Próximas Fases

### Fase 3 - Reportes Avanzados (Futuro)
- Análisis de clientes frecuentes
- Comparativas año a año
- Proyecciones y forecasting
- Reportes personalizables
- Dashboard interactivo
- Exportación a PDF

## Soporte

Para problemas o consultas:
1. Verificar que los permisos estén asignados
2. Revisar consola del navegador (F12) para errores
3. Confirmar que existan datos en el período analizado
4. Contactar al equipo de desarrollo con capturas de pantalla

---

**Implementado:** Diciembre 2024  
**Versión:** 2.0  
**Estado:** ✅ Producción

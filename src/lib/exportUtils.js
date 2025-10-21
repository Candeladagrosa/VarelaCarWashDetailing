import * as XLSX from 'xlsx';

/**
 * Exporta datos a un archivo Excel (.xlsx)
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {string} fileName - Nombre del archivo (sin extensión)
 * @param {string} sheetName - Nombre de la hoja de Excel
 */
export const exportToExcel = (data, fileName, sheetName = 'Datos') => {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas automáticamente
    const columnWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        columnWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      worksheet['!cols'] = columnWidths;
    }
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generar el archivo y descargarlo
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    return false;
  }
};

/**
 * Formatea datos de productos para exportación
 * @param {Array} productos - Array de productos desde Supabase
 * @returns {Array} - Array formateado para Excel
 */
export const formatProductosParaExcel = (productos) => {
  return productos.map(producto => ({
    'ID': producto.id_producto,
    'Nombre': producto.nombre,
    'Descripción': producto.descripcion || '',
    'Precio': producto.precio_actual,
    'Stock': producto.stock,
    'Visible': producto.visible ? 'Sí' : 'No',
    'Estado': producto.estado ? 'Activo' : 'Inactivo',
    'Fecha Creación': new Date(producto.created_at).toLocaleString('es-AR'),
    'Última Actualización': producto.updated_at ? new Date(producto.updated_at).toLocaleString('es-AR') : '-',
  }));
};

/**
 * Formatea datos de servicios para exportación
 * @param {Array} servicios - Array de servicios desde Supabase
 * @returns {Array} - Array formateado para Excel
 */
export const formatServiciosParaExcel = (servicios) => {
  return servicios.map(servicio => ({
    'ID': servicio.id_servicio,
    'Nombre': servicio.nombre,
    'Descripción': servicio.descripcion || '',
    'Precio': servicio.precio,
    'Duración (min)': servicio.duracion_minutos,
    'Visible': servicio.visible ? 'Sí' : 'No',
    'Estado': servicio.estado ? 'Activo' : 'Inactivo',
    'Fecha Creación': new Date(servicio.created_at).toLocaleString('es-AR'),
    'Última Actualización': servicio.updated_at ? new Date(servicio.updated_at).toLocaleString('es-AR') : '-',
  }));
};

/**
 * Formatea datos de turnos para exportación
 * @param {Array} turnos - Array de turnos desde Supabase (con joins de perfil y servicio)
 * @returns {Array} - Array formateado para Excel
 */
export const formatTurnosParaExcel = (turnos) => {
  return turnos.map(turno => {
    const perfil = turno.perfiles;
    const servicio = turno.servicios;
    
    return {
      'ID': turno.id_turno,
      'Cliente': perfil ? `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim() : 'N/A',
      'DNI': perfil?.dni || 'N/A',
      'Teléfono': perfil?.telefono || 'N/A',
      'Servicio': servicio?.nombre || 'N/A',
      'Fecha': turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-AR') : 'N/A',
      'Hora': turno.hora || 'N/A',
      'Estado': turno.estado || 'N/A',
      'Notas': turno.notas || '',
      'Fecha Creación': turno.created_at ? new Date(turno.created_at).toLocaleString('es-AR') : 'N/A',
    };
  });
};

/**
 * Formatea datos de pedidos para exportación
 * @param {Array} pedidos - Array de pedidos desde Supabase (con joins de cliente_data y productos)
 * @returns {Array} - Array formateado para Excel
 */
export const formatPedidosParaExcel = (pedidos) => {
  return pedidos.map(pedido => {
    const clienteData = pedido.cliente_data;
    const productos = pedido.pedido_productos || [];
    const cantidadItems = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
    
    return {
      'ID': pedido.id_pedido,
      'Cliente': clienteData ? `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim() : 'N/A',
      'Email': clienteData?.email || 'N/A',
      'DNI': clienteData?.dni || 'N/A',
      'Teléfono': clienteData?.telefono || 'N/A',
      'Total': pedido.total || 0,
      'Estado Pago': pedido.estado_pago || 'N/A',
      'Estado Envío': pedido.estado_envio || 'N/A',
      'Fecha Pedido': pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleString('es-AR') : 'N/A',
      'Cantidad Items': cantidadItems,
      'Productos': productos.map(p => `${p.cantidad}x ${p.productos?.nombre || 'N/A'}`).join(', '),
      'Fecha Creación': pedido.created_at ? new Date(pedido.created_at).toLocaleString('es-AR') : 'N/A',
    };
  });
};

/**
 * Formatea un número a moneda argentina
 * @param {number} valor - Valor numérico
 * @returns {string} - Valor formateado
 */
export const formatCurrency = (valor) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor);
};

/**
 * Formatea una fecha a formato argentino
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-AR');
};

/**
 * Formatea una fecha y hora a formato argentino
 * @param {string|Date} fechaHora - Fecha y hora a formatear
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (fechaHora) => {
  return new Date(fechaHora).toLocaleString('es-AR');
};

/**
 * Formatea datos de turnos agrupados por día
 * @param {Object} turnosPorDia - Objeto con fechas como claves y array de turnos como valores
 * @returns {Array} - Array formateado para Excel
 */
export const formatTurnosPorDiaParaExcel = (turnosPorDia) => {
  return Object.entries(turnosPorDia)
    .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Ordenar por fecha
    .map(([fecha, data]) => ({
      'Fecha': new Date(fecha).toLocaleDateString('es-AR'),
      'Día de la Semana': new Date(fecha).toLocaleDateString('es-AR', { weekday: 'long' }),
      'Cantidad de Turnos': data.cantidad,
      'Turnos Confirmados': data.confirmados,
      'Turnos Pendientes': data.pendientes,
      'Turnos Realizados': data.realizados,
      'Turnos Cancelados': data.cancelados,
      'Ingresos Estimados': data.ingresos,
      'Tasa de Ocupación %': data.tasaOcupacion,
    }));
};

/**
 * Formatea datos de turnos agrupados por servicio
 * @param {Array} turnosPorServicio - Array de servicios con estadísticas
 * @returns {Array} - Array formateado para Excel
 */
export const formatTurnosPorServicioParaExcel = (turnosPorServicio) => {
  return turnosPorServicio
    .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
    .map(servicio => ({
      'Servicio': servicio.nombre,
      'Cantidad de Turnos': servicio.cantidad,
      'Porcentaje del Total %': servicio.porcentaje,
      'Turnos Confirmados': servicio.confirmados,
      'Turnos Realizados': servicio.realizados,
      'Turnos Cancelados': servicio.cancelados,
      'Precio del Servicio': servicio.precio,
      'Ingresos Totales': servicio.ingresos,
      'Promedio Diario': servicio.promedioDiario,
    }));
};

/**
 * Formatea datos de ingresos por período
 * @param {Object} ingresosPorPeriodo - Objeto con datos de ingresos
 * @returns {Array} - Array formateado para Excel
 */
export const formatIngresosPorPeriodoParaExcel = (ingresosPorPeriodo) => {
  const { resumen, porDia, porMes } = ingresosPorPeriodo;
  
  const resultado = [];
  
  // Resumen general
  resultado.push({
    'Tipo': 'RESUMEN GENERAL',
    'Período': resumen.periodo,
    'Total Ingresos': resumen.totalIngresos,
    'Ingresos por Servicios': resumen.ingresosPorServicios,
    'Ingresos por Productos': resumen.ingresosPorProductos,
    'Cantidad de Turnos': resumen.cantidadTurnos,
    'Cantidad de Pedidos': resumen.cantidadPedidos,
    'Ticket Promedio': resumen.ticketPromedio,
  });
  
  // Espacio en blanco
  resultado.push({});
  
  // Ingresos por día
  if (porDia && porDia.length > 0) {
    resultado.push({ 'Tipo': 'INGRESOS POR DÍA' });
    porDia.forEach(dia => {
      resultado.push({
        'Tipo': 'Día',
        'Fecha': new Date(dia.fecha).toLocaleDateString('es-AR'),
        'Día de la Semana': new Date(dia.fecha).toLocaleDateString('es-AR', { weekday: 'long' }),
        'Total Ingresos': dia.total,
        'Servicios': dia.servicios,
        'Productos': dia.productos,
        'Cantidad de Transacciones': dia.transacciones,
      });
    });
  }
  
  // Espacio en blanco
  resultado.push({});
  
  // Ingresos por mes
  if (porMes && porMes.length > 0) {
    resultado.push({ 'Tipo': 'INGRESOS POR MES' });
    porMes.forEach(mes => {
      resultado.push({
        'Tipo': 'Mes',
        'Mes': mes.mes,
        'Año': mes.anio,
        'Total Ingresos': mes.total,
        'Servicios': mes.servicios,
        'Productos': mes.productos,
        'Crecimiento vs Mes Anterior %': mes.crecimiento,
      });
    });
  }
  
  return resultado;
};

/**
 * Formatea datos de unidades vendidas por producto
 * @param {Array} unidadesVendidas - Array de productos con cantidad vendida
 * @returns {Array} - Array formateado para Excel
 */
export const formatUnidadesVendidasParaExcel = (unidadesVendidas) => {
  return unidadesVendidas
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas) // Ordenar por unidades descendente
    .map((producto, index) => ({
      'Ranking': index + 1,
      'Producto': producto.nombre,
      'Unidades Vendidas': producto.unidadesVendidas,
      'Porcentaje del Total %': producto.porcentaje,
      'Precio Actual': producto.precioActual,
      'Ingresos Totales': producto.ingresosTotales,
      'Stock Actual': producto.stockActual,
      'Estado Stock': producto.estadoStock,
      'Promedio Diario': producto.promedioDiario,
      'Tendencia': producto.tendencia,
    }));
};

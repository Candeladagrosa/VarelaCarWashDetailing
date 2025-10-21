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
 * @param {Array} pedidos - Array de pedidos desde Supabase (con joins de usuario y detalles)
 * @returns {Array} - Array formateado para Excel
 */
export const formatPedidosParaExcel = (pedidos) => {
  return pedidos.map(pedido => ({
    'ID': pedido.id_pedido,
    'Cliente': pedido.usuarios?.nombre_completo || 'N/A',
    'Email': pedido.usuarios?.email || 'N/A',
    'Total': pedido.total,
    'Estado': pedido.estado,
    'Fecha': new Date(pedido.fecha_pedido).toLocaleString('es-AR'),
    'Método Pago': pedido.metodo_pago || 'N/A',
    'Cantidad Items': pedido.pedido_detalles?.length || 0,
    'Notas': pedido.notas || '',
  }));
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

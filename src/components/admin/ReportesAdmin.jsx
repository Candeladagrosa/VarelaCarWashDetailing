import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileBarChart, 
  Download, 
  Package, 
  Wrench, 
  Calendar, 
  ShoppingBag,
  Loader2,
  FileSpreadsheet,
  Info,
  TrendingUp,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Shield,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import PermissionGuard from '@/components/PermissionGuard';
import {
  exportToExcel,
  formatProductosParaExcel,
  formatServiciosParaExcel,
  formatTurnosParaExcel,
  formatPedidosParaExcel,
  formatTurnosPorDiaParaExcel,
  formatTurnosPorServicioParaExcel,
  formatIngresosPorPeriodoParaExcel,
  formatUnidadesVendidasParaExcel,
  formatAuditoriaParaExcel
} from '@/lib/exportUtils';

/**
 * Componente para gestionar y exportar reportes del sistema
 * Permite exportar productos, servicios, turnos y pedidos a Excel
 */
const ReportesAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({});
  const [showFilters, setShowFilters] = useState({});
  
  // Filtros genéricos de fecha para todos los reportes
  const [filtrosFecha, setFiltrosFecha] = useState({
    productos: { fecha_desde: '', fecha_hasta: '' },
    servicios: { fecha_desde: '', fecha_hasta: '' },
    turnos: { fecha_desde: '', fecha_hasta: '' },
    pedidos: { fecha_desde: '', fecha_hasta: '' },
    turnos_dia: { fecha_desde: '', fecha_hasta: '' },
    turnos_servicio: { fecha_desde: '', fecha_hasta: '' },
    ingresos: { fecha_desde: '', fecha_hasta: '' },
    unidades: { fecha_desde: '', fecha_hasta: '' },
  });
  
  // Filtros específicos de auditoría
  const [auditoriaFilters, setAuditoriaFilters] = useState({
    usuario_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    accion: '',
    tabla: '',
  });

  /**
   * Establece el estado de carga para un reporte específico
   */
  const setReportLoading = (reportName, isLoading) => {
    setLoading(prev => ({ ...prev, [reportName]: isLoading }));
  };

  /**
   * Alterna la visibilidad de filtros para un reporte específico
   */
  const toggleFilters = (reportId) => {
    setShowFilters(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  /**
   * Actualiza los filtros de fecha para un reporte específico
   */
  const updateFiltrosFecha = (reportId, campo, valor) => {
    setFiltrosFecha(prev => ({
      ...prev,
      [reportId]: { ...prev[reportId], [campo]: valor }
    }));
  };

  /**
   * Limpia los filtros de fecha para un reporte específico
   */
  const limpiarFiltrosFecha = (reportId) => {
    setFiltrosFecha(prev => ({
      ...prev,
      [reportId]: { fecha_desde: '', fecha_hasta: '' }
    }));
  };

  /**
   * Exporta el listado de productos a Excel
   */
  const exportarProductos = async () => {
    try {
      setReportLoading('productos', true);

      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay productos para exportar',
        });
        return;
      }

      const formatted = formatProductosParaExcel(data);
      const success = exportToExcel(formatted, 'Productos', 'Productos');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${data.length} productos correctamente`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando productos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el listado de productos',
      });
    } finally {
      setReportLoading('productos', false);
    }
  };

  /**
   * Exporta el listado de servicios a Excel
   */
  const exportarServicios = async () => {
    try {
      setReportLoading('servicios', true);

      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay servicios para exportar',
        });
        return;
      }

      const formatted = formatServiciosParaExcel(data);
      const success = exportToExcel(formatted, 'Servicios', 'Servicios');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${data.length} servicios correctamente`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando servicios:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el listado de servicios',
      });
    } finally {
      setReportLoading('servicios', false);
    }
  };

  /**
   * Exporta el listado de turnos a Excel
   */
  const exportarTurnos = async () => {
    try {
      setReportLoading('turnos', true);

      // 1. Cargar turnos con servicios (igual que TurnosAdmin)
      let query = supabase
        .from('turnos')
        .select(`
          *,
          servicios (
            nombre,
            precio
          )
        `);

      // Aplicar filtros de fecha (usando el campo 'fecha' de turnos)
      if (filtrosFecha.turnos.fecha_desde) {
        query = query.gte('fecha', filtrosFecha.turnos.fecha_desde);
      }
      if (filtrosFecha.turnos.fecha_hasta) {
        query = query.lte('fecha', filtrosFecha.turnos.fecha_hasta);
      }

      query = query.order('created_at', { ascending: false });

      const { data: turnosData, error: turnosError } = await query;

      if (turnosError) throw turnosError;

      if (!turnosData || turnosData.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay turnos para exportar',
        });
        return;
      }

      // 2. Obtener IDs únicos de clientes
      const clienteIds = [...new Set(turnosData.map(t => t.id_cliente).filter(Boolean))];

      // 3. Cargar datos de perfiles de clientes
      let perfilesMap = {};
      if (clienteIds.length > 0) {
        const { data: perfilesData, error: perfilesError } = await supabase
          .from('perfiles')
          .select('id, nombre, apellido, dni, telefono')
          .in('id', clienteIds);

        if (!perfilesError && perfilesData) {
          // Crear un mapa de perfiles para acceso rápido
          perfilesData.forEach(p => {
            perfilesMap[p.id] = p;
          });
        }
      }

      // 4. Combinar datos de turnos con perfiles
      const turnosConPerfiles = turnosData.map(turno => ({
        ...turno,
        perfiles: perfilesMap[turno.id_cliente] || null
      }));

      const formatted = formatTurnosParaExcel(turnosConPerfiles);
      const success = exportToExcel(formatted, 'Turnos', 'Turnos');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${turnosData.length} turnos correctamente`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando turnos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el listado de turnos',
      });
    } finally {
      setReportLoading('turnos', false);
    }
  };

  /**
   * Exporta el listado de pedidos a Excel
   */
  const exportarPedidos = async () => {
    try {
      setReportLoading('pedidos', true);

      // Query que coincide con la estructura de PedidosAdmin
      let query = supabase
        .from('pedidos')
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
        `);

      // Aplicar filtros de fecha
      if (filtrosFecha.pedidos.fecha_desde) {
        query = query.gte('fecha_pedido', `${filtrosFecha.pedidos.fecha_desde}T00:00:00`);
      }
      if (filtrosFecha.pedidos.fecha_hasta) {
        query = query.lte('fecha_pedido', `${filtrosFecha.pedidos.fecha_hasta}T23:59:59`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay pedidos para exportar',
        });
        return;
      }

      const formatted = formatPedidosParaExcel(data);
      const success = exportToExcel(formatted, 'Pedidos', 'Pedidos');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${data.length} pedidos correctamente`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando pedidos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el listado de pedidos',
      });
    } finally {
      setReportLoading('pedidos', false);
    }
  };

  /**
   * Exporta análisis de turnos por día
   */
  const exportarTurnosPorDia = async () => {
    try {
      setReportLoading('turnos_dia', true);

      // Determinar rango de fechas
      let fechaInicio;
      if (filtrosFecha.turnos_dia.fecha_desde) {
        fechaInicio = filtrosFecha.turnos_dia.fecha_desde;
      } else {
        // Por defecto, hace 30 días
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 30);
        fechaInicio = fecha.toISOString().split('T')[0];
      }

      let query = supabase
        .from('turnos')
        .select(`
          *,
          servicios (precio)
        `)
        .gte('fecha', fechaInicio);

      // Aplicar fecha hasta si está definida
      if (filtrosFecha.turnos_dia.fecha_hasta) {
        query = query.lte('fecha', filtrosFecha.turnos_dia.fecha_hasta);
      }

      query = query.order('fecha', { ascending: true });

      const { data: turnos, error } = await query;

      if (error) throw error;

      if (!turnos || turnos.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay turnos en los últimos 30 días',
        });
        return;
      }

      // Agrupar por día
      const turnosPorDia = {};
      const maxTurnosPorDia = 10; // Capacidad máxima estimada

      turnos.forEach(turno => {
        const fecha = turno.fecha;
        
        if (!turnosPorDia[fecha]) {
          turnosPorDia[fecha] = {
            cantidad: 0,
            confirmados: 0,
            pendientes: 0,
            realizados: 0,
            cancelados: 0,
            ingresos: 0,
            tasaOcupacion: 0,
          };
        }

        turnosPorDia[fecha].cantidad++;
        
        // Contar por estado
        if (turno.estado === 'Confirmado') turnosPorDia[fecha].confirmados++;
        if (turno.estado === 'Pendiente') turnosPorDia[fecha].pendientes++;
        if (turno.estado === 'Realizado') turnosPorDia[fecha].realizados++;
        if (turno.estado === 'Cancelado') turnosPorDia[fecha].cancelados++;

        // Calcular ingresos (solo turnos realizados)
        if (turno.estado === 'Realizado' && turno.servicios?.precio) {
          turnosPorDia[fecha].ingresos += turno.servicios.precio;
        }
      });

      // Calcular tasa de ocupación
      Object.keys(turnosPorDia).forEach(fecha => {
        const data = turnosPorDia[fecha];
        data.tasaOcupacion = ((data.cantidad / maxTurnosPorDia) * 100).toFixed(2);
      });

      const formatted = formatTurnosPorDiaParaExcel(turnosPorDia);
      const success = exportToExcel(formatted, 'Turnos_por_Dia', 'Turnos por Día');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${Object.keys(turnosPorDia).length} días de análisis`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando turnos por día:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el análisis de turnos por día',
      });
    } finally {
      setReportLoading('turnos_dia', false);
    }
  };

  /**
   * Exporta análisis de turnos por servicio
   */
  const exportarTurnosPorServicio = async () => {
    try {
      setReportLoading('turnos_servicio', true);

      // Obtener todos los turnos con servicios
      let query = supabase
        .from('turnos')
        .select(`
          *,
          servicios (
            id_servicio,
            nombre,
            precio
          )
        `);

      // Aplicar filtros de fecha
      if (filtrosFecha.turnos_servicio.fecha_desde) {
        query = query.gte('fecha', filtrosFecha.turnos_servicio.fecha_desde);
      }
      if (filtrosFecha.turnos_servicio.fecha_hasta) {
        query = query.lte('fecha', filtrosFecha.turnos_servicio.fecha_hasta);
      }

      query = query.order('created_at', { ascending: false });

      const { data: turnos, error } = await query;

      if (error) throw error;

      if (!turnos || turnos.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay turnos para analizar',
        });
        return;
      }

      // Calcular días del período
      const fechas = turnos.map(t => new Date(t.fecha));
      const fechaMin = new Date(Math.min(...fechas));
      const fechaMax = new Date(Math.max(...fechas));
      const diasDelPeriodo = Math.ceil((fechaMax - fechaMin) / (1000 * 60 * 60 * 24)) || 1;

      // Agrupar por servicio
      const serviciosMap = {};
      const totalTurnos = turnos.length;

      turnos.forEach(turno => {
        const servicio = turno.servicios;
        if (!servicio) return;

        const idServicio = servicio.id_servicio;
        
        if (!serviciosMap[idServicio]) {
          serviciosMap[idServicio] = {
            nombre: servicio.nombre,
            precio: servicio.precio || 0,
            cantidad: 0,
            confirmados: 0,
            realizados: 0,
            cancelados: 0,
            ingresos: 0,
            porcentaje: 0,
            promedioDiario: 0,
          };
        }

        serviciosMap[idServicio].cantidad++;
        
        if (turno.estado === 'Confirmado') serviciosMap[idServicio].confirmados++;
        if (turno.estado === 'Realizado') serviciosMap[idServicio].realizados++;
        if (turno.estado === 'Cancelado') serviciosMap[idServicio].cancelados++;

        // Calcular ingresos (solo turnos realizados)
        if (turno.estado === 'Realizado') {
          serviciosMap[idServicio].ingresos += servicio.precio || 0;
        }
      });

      // Calcular porcentajes y promedios
      const turnosPorServicio = Object.values(serviciosMap).map(servicio => ({
        ...servicio,
        porcentaje: ((servicio.cantidad / totalTurnos) * 100).toFixed(2),
        promedioDiario: (servicio.cantidad / diasDelPeriodo).toFixed(2),
      }));

      const formatted = formatTurnosPorServicioParaExcel(turnosPorServicio);
      const success = exportToExcel(formatted, 'Turnos_por_Servicio', 'Turnos por Servicio');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${turnosPorServicio.length} servicios analizados`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando turnos por servicio:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el análisis de turnos por servicio',
      });
    } finally {
      setReportLoading('turnos_servicio', false);
    }
  };

  /**
   * Exporta análisis de ingresos por período
   */
  const exportarIngresosPorPeriodo = async () => {
    try {
      setReportLoading('ingresos', true);

      // Obtener turnos realizados con filtros de fecha
      let turnosQuery = supabase
        .from('turnos')
        .select(`
          *,
          servicios (precio)
        `)
        .eq('estado', 'Realizado');

      if (filtrosFecha.ingresos.fecha_desde) {
        turnosQuery = turnosQuery.gte('fecha', filtrosFecha.ingresos.fecha_desde);
      }
      if (filtrosFecha.ingresos.fecha_hasta) {
        turnosQuery = turnosQuery.lte('fecha', filtrosFecha.ingresos.fecha_hasta);
      }

      turnosQuery = turnosQuery.order('fecha', { ascending: true });

      const { data: turnos, error: turnosError } = await turnosQuery;

      if (turnosError) throw turnosError;

      // Obtener pedidos pagados con filtros de fecha
      let pedidosQuery = supabase
        .from('pedidos')
        .select('*')
        .eq('estado_pago', 'Pagado');

      if (filtrosFecha.ingresos.fecha_desde) {
        pedidosQuery = pedidosQuery.gte('fecha_pedido', `${filtrosFecha.ingresos.fecha_desde}T00:00:00`);
      }
      if (filtrosFecha.ingresos.fecha_hasta) {
        pedidosQuery = pedidosQuery.lte('fecha_pedido', `${filtrosFecha.ingresos.fecha_hasta}T23:59:59`);
      }

      pedidosQuery = pedidosQuery.order('fecha_pedido', { ascending: true });

      const { data: pedidos, error: pedidosError } = await pedidosQuery;

      if (pedidosError) throw pedidosError;

      if ((!turnos || turnos.length === 0) && (!pedidos || pedidos.length === 0)) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay ingresos para analizar',
        });
        return;
      }

      // Calcular resumen general
      const ingresosPorServicios = turnos?.reduce((sum, t) => sum + (t.servicios?.precio || 0), 0) || 0;
      const ingresosPorProductos = pedidos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
      const totalIngresos = ingresosPorServicios + ingresosPorProductos;
      const cantidadTurnos = turnos?.length || 0;
      const cantidadPedidos = pedidos?.length || 0;
      const ticketPromedio = totalIngresos / (cantidadTurnos + cantidadPedidos) || 0;

      // Calcular período
      const todasFechas = [
        ...(turnos?.map(t => new Date(t.fecha)) || []),
        ...(pedidos?.map(p => new Date(p.fecha_pedido)) || [])
      ];
      const fechaMin = new Date(Math.min(...todasFechas));
      const fechaMax = new Date(Math.max(...todasFechas));
      const periodo = `${fechaMin.toLocaleDateString('es-AR')} - ${fechaMax.toLocaleDateString('es-AR')}`;

      // Agrupar por día
      const ingresosPorDia = {};
      
      turnos?.forEach(turno => {
        const fecha = turno.fecha;
        if (!ingresosPorDia[fecha]) {
          ingresosPorDia[fecha] = { fecha, servicios: 0, productos: 0, total: 0, transacciones: 0 };
        }
        ingresosPorDia[fecha].servicios += turno.servicios?.precio || 0;
        ingresosPorDia[fecha].total += turno.servicios?.precio || 0;
        ingresosPorDia[fecha].transacciones++;
      });

      pedidos?.forEach(pedido => {
        const fecha = pedido.fecha_pedido.split('T')[0];
        if (!ingresosPorDia[fecha]) {
          ingresosPorDia[fecha] = { fecha, servicios: 0, productos: 0, total: 0, transacciones: 0 };
        }
        ingresosPorDia[fecha].productos += pedido.total || 0;
        ingresosPorDia[fecha].total += pedido.total || 0;
        ingresosPorDia[fecha].transacciones++;
      });

      const porDia = Object.values(ingresosPorDia).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      // Agrupar por mes
      const ingresosPorMes = {};
      
      porDia.forEach(dia => {
        const fecha = new Date(dia.fecha);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!ingresosPorMes[mesAnio]) {
          ingresosPorMes[mesAnio] = {
            mes: fecha.toLocaleDateString('es-AR', { month: 'long' }),
            anio: fecha.getFullYear(),
            servicios: 0,
            productos: 0,
            total: 0,
          };
        }
        
        ingresosPorMes[mesAnio].servicios += dia.servicios;
        ingresosPorMes[mesAnio].productos += dia.productos;
        ingresosPorMes[mesAnio].total += dia.total;
      });

      const porMes = Object.values(ingresosPorMes);
      
      // Calcular crecimiento mes a mes
      porMes.forEach((mes, index) => {
        if (index > 0) {
          const mesAnterior = porMes[index - 1].total;
          mes.crecimiento = mesAnterior > 0 
            ? (((mes.total - mesAnterior) / mesAnterior) * 100).toFixed(2) 
            : 0;
        } else {
          mes.crecimiento = 0;
        }
      });

      const ingresosPorPeriodo = {
        resumen: {
          periodo,
          totalIngresos: totalIngresos.toFixed(2),
          ingresosPorServicios: ingresosPorServicios.toFixed(2),
          ingresosPorProductos: ingresosPorProductos.toFixed(2),
          cantidadTurnos,
          cantidadPedidos,
          ticketPromedio: ticketPromedio.toFixed(2),
        },
        porDia,
        porMes,
      };

      const formatted = formatIngresosPorPeriodoParaExcel(ingresosPorPeriodo);
      const success = exportToExcel(formatted, 'Ingresos_por_Periodo', 'Ingresos');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Análisis de ingresos: $${totalIngresos.toLocaleString()}`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando ingresos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el análisis de ingresos',
      });
    } finally {
      setReportLoading('ingresos', false);
    }
  };

  /**
   * Exporta cantidad de unidades vendidas por producto en el mes
   */
  const exportarUnidadesVendidas = async () => {
    try {
      setReportLoading('unidades', true);

      // Determinar rango de fechas
      let fechaInicio, fechaFin;
      const hoy = new Date();
      
      if (filtrosFecha.unidades.fecha_desde) {
        fechaInicio = new Date(filtrosFecha.unidades.fecha_desde);
      } else {
        // Por defecto, primer día del mes
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      }

      if (filtrosFecha.unidades.fecha_hasta) {
        fechaFin = new Date(filtrosFecha.unidades.fecha_hasta);
      } else {
        fechaFin = hoy;
      }

      const diasDelPeriodo = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) || 1;

      // Obtener pedidos del período
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          pedido_productos (
            cantidad,
            id_producto,
            productos (
              id_producto,
              nombre,
              precio_actual,
              stock
            )
          )
        `)
        .gte('fecha_pedido', fechaInicio.toISOString());

      if (filtrosFecha.unidades.fecha_hasta) {
        query = query.lte('fecha_pedido', `${filtrosFecha.unidades.fecha_hasta}T23:59:59`);
      }

      query = query.order('fecha_pedido', { ascending: false });

      const { data: pedidos, error: pedidosError } = await query;

      if (pedidosError) throw pedidosError;

      if (!pedidos || pedidos.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay ventas de productos en este mes',
        });
        return;
      }

      // Agrupar por producto
      const productosMap = {};
      let totalUnidades = 0;

      pedidos.forEach(pedido => {
        pedido.pedido_productos?.forEach(pp => {
          const producto = pp.productos;
          if (!producto) return;

          const idProducto = producto.id_producto;
          
          if (!productosMap[idProducto]) {
            productosMap[idProducto] = {
              nombre: producto.nombre,
              precioActual: producto.precio_actual,
              stockActual: producto.stock,
              unidadesVendidas: 0,
              ingresosTotales: 0,
              porcentaje: 0,
              promedioDiario: 0,
              estadoStock: '',
              tendencia: '',
            };
          }

          productosMap[idProducto].unidadesVendidas += pp.cantidad || 0;
          productosMap[idProducto].ingresosTotales += (pp.cantidad || 0) * (producto.precio_actual || 0);
          totalUnidades += pp.cantidad || 0;
        });
      });

      // Calcular métricas
      const unidadesVendidas = Object.values(productosMap).map(producto => {
        const porcentaje = ((producto.unidadesVendidas / totalUnidades) * 100).toFixed(2);
        const promedioDiario = (producto.unidadesVendidas / diasDelPeriodo).toFixed(2);
        
        // Estado de stock
        let estadoStock = 'Normal';
        if (producto.stockActual === 0) estadoStock = 'Sin Stock';
        else if (producto.stockActual < producto.unidadesVendidas * 0.5) estadoStock = 'Bajo';
        else if (producto.stockActual > producto.unidadesVendidas * 3) estadoStock = 'Exceso';
        
        // Tendencia
        let tendencia = 'Estable';
        if (producto.unidadesVendidas > totalUnidades * 0.15) tendencia = 'Alta Demanda';
        else if (producto.unidadesVendidas < totalUnidades * 0.05) tendencia = 'Baja Demanda';

        return {
          ...producto,
          porcentaje,
          promedioDiario,
          estadoStock,
          tendencia,
        };
      });

      const formatted = formatUnidadesVendidasParaExcel(unidadesVendidas);
      const success = exportToExcel(formatted, 'Unidades_Vendidas', 'Unidades Vendidas');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se analizaron ${unidadesVendidas.length} productos del mes`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando unidades vendidas:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el análisis de unidades vendidas',
      });
    } finally {
      setReportLoading('unidades', false);
    }
  };

  /**
   * Exporta el registro de auditoría con filtros opcionales
   */
  const exportarAuditoria = async () => {
    try {
      setReportLoading('auditoria', true);

      // 1. Construir query base para auditoría
      let query = supabase
        .from('auditoria')
        .select('*')
        .order('creado_en', { ascending: false });

      // Aplicar filtros
      if (auditoriaFilters.usuario_id) {
        query = query.eq('usuario_id', auditoriaFilters.usuario_id);
      }

      if (auditoriaFilters.fecha_desde) {
        query = query.gte('creado_en', `${auditoriaFilters.fecha_desde}T00:00:00`);
      }

      if (auditoriaFilters.fecha_hasta) {
        query = query.lte('creado_en', `${auditoriaFilters.fecha_hasta}T23:59:59`);
      }

      if (auditoriaFilters.accion) {
        query = query.eq('accion', auditoriaFilters.accion);
      }

      if (auditoriaFilters.tabla) {
        query = query.eq('tabla', auditoriaFilters.tabla);
      }

      const { data: auditoriaData, error: auditoriaError } = await query;

      if (auditoriaError) throw auditoriaError;

      if (!auditoriaData || auditoriaData.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay registros de auditoría para exportar con los filtros seleccionados',
        });
        return;
      }

      // 2. Obtener IDs únicos de usuarios
      const usuariosIds = [...new Set(auditoriaData.map(r => r.usuario_id).filter(Boolean))];

      // 3. Cargar datos de perfiles de usuarios
      let perfilesMap = {};
      if (usuariosIds.length > 0) {
        const { data: perfilesData, error: perfilesError } = await supabase
          .from('perfiles')
          .select('id, nombre, apellido')
          .in('id', usuariosIds);

        if (!perfilesError && perfilesData) {
          // Crear un mapa de perfiles para acceso rápido
          perfilesData.forEach(p => {
            perfilesMap[p.id] = p;
          });
        }
      }

      // 4. Obtener emails de los usuarios usando función RPC
      const emailsMap = {};
      if (usuariosIds.length > 0) {
        try {
          const { data: emailsData, error: emailsError } = await supabase
            .rpc('get_users_emails', { user_ids: usuariosIds });
          
          if (!emailsError && emailsData) {
            emailsData.forEach(item => {
              emailsMap[item.id] = item.email;
            });
          }
        } catch (err) {
          console.warn('No se pudieron obtener los emails de los usuarios:', err);
        }
      }

      // 5. Combinar datos de auditoría con perfiles y emails
      const auditoriaConPerfiles = auditoriaData.map(registro => ({
        ...registro,
        perfiles: registro.usuario_id && perfilesMap[registro.usuario_id] ? {
          ...perfilesMap[registro.usuario_id],
          email: emailsMap[registro.usuario_id] || null
        } : null
      }));

      const formatted = formatAuditoriaParaExcel(auditoriaConPerfiles);
      const success = exportToExcel(formatted, 'Auditoria', 'Auditoría');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${auditoriaData.length} registros de auditoría`,
        });
      } else {
        throw new Error('Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error exportando auditoría:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el registro de auditoría',
      });
    } finally {
      setReportLoading('auditoria', false);
    }
  };

  /**
   * Limpia los filtros de auditoría
   */
  const limpiarFiltrosAuditoria = () => {
    setAuditoriaFilters({
      usuario_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      accion: '',
      tabla: '',
    });
  };

  /**
   * Configuración de reportes disponibles
   */
  const reportes = [
    // ============================================
    // FASE 1: Reportes Básicos de Exportación
    // ============================================
    {
      id: 'productos',
      nombre: 'Exportación de Productos',
      descripcion: 'Exporta el listado completo de productos con precios, stock y estado',
      icon: Package,
      color: 'from-blue-600 to-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      permission: 'reportes.exportar_productos',
      onClick: exportarProductos,
      categoria: 'Exportaciones Básicas',
    },
    {
      id: 'servicios',
      nombre: 'Exportación de Servicios',
      descripcion: 'Exporta el listado completo de servicios con precios y duración',
      icon: Wrench,
      color: 'from-green-600 to-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      permission: 'reportes.exportar_servicios',
      onClick: exportarServicios,
      categoria: 'Exportaciones Básicas',
    },
    {
      id: 'turnos',
      nombre: 'Exportación de Turnos',
      descripcion: 'Exporta el listado completo de turnos con clientes y servicios',
      icon: Calendar,
      color: 'from-purple-600 to-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      permission: 'reportes.exportar_turnos',
      onClick: exportarTurnos,
      categoria: 'Exportaciones Básicas',
      hasFilters: true,
    },
    {
      id: 'pedidos',
      nombre: 'Exportación de Pedidos',
      descripcion: 'Exporta el listado completo de pedidos con totales y estados',
      icon: ShoppingBag,
      color: 'from-orange-600 to-orange-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      permission: 'reportes.exportar_pedidos',
      onClick: exportarPedidos,
      categoria: 'Exportaciones Básicas',
      hasFilters: true,
    },

    // ============================================
    // FASE 2: Reportes Analíticos
    // ============================================
    {
      id: 'turnos_dia',
      nombre: 'Turnos por Día',
      descripcion: 'Análisis de turnos agrupados por día con tasas de ocupación',
      icon: Calendar,
      color: 'from-indigo-600 to-indigo-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      permission: 'reportes.turnos_por_dia',
      onClick: exportarTurnosPorDia,
      categoria: 'Reportes Analíticos',
      hasFilters: true,
    },
    {
      id: 'turnos_servicio',
      nombre: 'Turnos por Servicio',
      descripcion: 'Análisis de demanda por servicio con porcentajes y tendencias',
      icon: BarChart3,
      color: 'from-cyan-600 to-cyan-500',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      permission: 'reportes.turnos_por_servicio',
      onClick: exportarTurnosPorServicio,
      categoria: 'Reportes Analíticos',
      hasFilters: true,
    },
    {
      id: 'ingresos',
      nombre: 'Ingresos por Período',
      descripcion: 'Análisis completo de ingresos por día y mes con comparativas',
      icon: DollarSign,
      color: 'from-emerald-600 to-emerald-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      permission: 'reportes.ingresos_periodo',
      onClick: exportarIngresosPorPeriodo,
      categoria: 'Reportes Analíticos',
      hasFilters: true,
    },
    {
      id: 'unidades',
      nombre: 'Unidades Vendidas',
      descripcion: 'Ranking de productos más vendidos con análisis de stock (configurable por período)',
      hasFilters: true,
      icon: ShoppingCart,
      color: 'from-rose-600 to-rose-500',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      permission: 'reportes.unidades_vendidas',
      onClick: exportarUnidadesVendidas,
      categoria: 'Reportes Analíticos',
    },

    // ============================================
    // FASE 3: Auditoría y Seguridad
    // ============================================
    {
      id: 'auditoria',
      nombre: 'Registro de Auditoría',
      descripcion: 'Exporta el historial completo de cambios en el sistema con filtros',
      icon: Shield,
      color: 'from-slate-600 to-slate-500',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
      permission: 'reportes.auditoria',
      onClick: exportarAuditoria,
      categoria: 'Auditoría y Seguridad',
      hasFilters: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileBarChart className="w-6 h-6 mr-2 text-red-500" />
            Reportes y Exportaciones
          </h2>
          <p className="text-gray-600 mt-1">
            Exporta información del sistema a formato Excel
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Exportación de datos</p>
          <p>
            Los reportes se descargarán automáticamente en formato Excel (.xlsx). 
            El nombre del archivo incluirá la fecha y hora de generación.
          </p>
        </div>
      </div>

      {/* Grid de Reportes */}
      <div className="space-y-8">
        {/* Exportaciones Básicas */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-red-500" />
            Exportaciones Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportes.filter(r => r.categoria === 'Exportaciones Básicas').map((reporte, index) => {
              const Icon = reporte.icon;
              const isLoading = loading[reporte.id];

              return (
                <PermissionGuard key={reporte.id} permission={reporte.permission}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Icono y título */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-14 h-14 ${reporte.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${reporte.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {reporte.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reporte.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Botón para mostrar/ocultar filtros */}
                    {reporte.hasFilters && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFilters(reporte.id)}
                        className="w-full mb-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all"
                      >
                        <Filter className="w-4 h-4" />
                        <span>{showFilters[reporte.id] ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                      </motion.button>
                    )}

                    {/* Filtros de Fecha */}
                    {reporte.hasFilters && showFilters[reporte.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Filtros de fecha</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fecha Desde */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Desde
                            </label>
                            <input
                              type="date"
                              value={filtrosFecha[reporte.id]?.fecha_desde || ''}
                              onChange={(e) => updateFiltrosFecha(reporte.id, 'fecha_desde', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Fecha Hasta */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Hasta
                            </label>
                            <input
                              type="date"
                              value={filtrosFecha[reporte.id]?.fecha_hasta || ''}
                              onChange={(e) => updateFiltrosFecha(reporte.id, 'fecha_hasta', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Botón limpiar filtros */}
                        <button
                          onClick={() => limpiarFiltrosFecha(reporte.id)}
                          className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Limpiar filtros
                        </button>
                      </motion.div>
                    )}

                    {/* Botón de exportación */}
                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      onClick={reporte.onClick}
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r ${reporte.color} text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Exportar a Excel</span>
                        </>
                      )}
                    </motion.button>

                    {/* Formato del archivo */}
                    <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      <span>Formato: XLSX (Excel)</span>
                    </div>
                  </motion.div>
                </PermissionGuard>
              );
            })}
          </div>
        </div>

        {/* Reportes Analíticos */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
            Reportes Analíticos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportes.filter(r => r.categoria === 'Reportes Analíticos').map((reporte, index) => {
              const Icon = reporte.icon;
              const isLoading = loading[reporte.id];

              return (
                <PermissionGuard key={reporte.id} permission={reporte.permission}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Icono y título */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-14 h-14 ${reporte.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${reporte.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {reporte.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reporte.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Botón para mostrar/ocultar filtros */}
                    {reporte.hasFilters && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFilters(reporte.id)}
                        className="w-full mb-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all"
                      >
                        <Filter className="w-4 h-4" />
                        <span>{showFilters[reporte.id] ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                      </motion.button>
                    )}

                    {/* Filtros de Fecha */}
                    {reporte.hasFilters && showFilters[reporte.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Filtros de fecha</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fecha Desde */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Desde
                            </label>
                            <input
                              type="date"
                              value={filtrosFecha[reporte.id]?.fecha_desde || ''}
                              onChange={(e) => updateFiltrosFecha(reporte.id, 'fecha_desde', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>

                          {/* Fecha Hasta */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Hasta
                            </label>
                            <input
                              type="date"
                              value={filtrosFecha[reporte.id]?.fecha_hasta || ''}
                              onChange={(e) => updateFiltrosFecha(reporte.id, 'fecha_hasta', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Botón limpiar filtros */}
                        <button
                          onClick={() => limpiarFiltrosFecha(reporte.id)}
                          className="mt-3 text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                        >
                          Limpiar filtros
                        </button>
                      </motion.div>
                    )}

                    {/* Botón de exportación */}
                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      onClick={reporte.onClick}
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r ${reporte.color} text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Analizando...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-5 h-5" />
                          <span>Generar Reporte</span>
                        </>
                      )}
                    </motion.button>

                    {/* Formato del archivo */}
                    <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      <span>Análisis en XLSX</span>
                    </div>
                  </motion.div>
                </PermissionGuard>
              );
            })}
          </div>
        </div>

        {/* Auditoría y Seguridad */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-500" />
            Auditoría y Seguridad
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {reportes.filter(r => r.categoria === 'Auditoría y Seguridad').map((reporte, index) => {
              const Icon = reporte.icon;
              const isLoading = loading[reporte.id];

              return (
                <PermissionGuard 
                  key={reporte.id} 
                  permission={reporte.permission}
                  fallback={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-7 h-7 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {reporte.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {reporte.descripcion}
                          </p>
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                            <p className="text-sm text-yellow-800 font-medium">
                              ⚠️ No tienes permisos para acceder a esta funcionalidad
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Permiso requerido: <code className="bg-yellow-200 px-1 rounded">{reporte.permission}</code>
                            </p>
                            <p className="text-xs text-yellow-700 mt-2">
                              Para habilitar este reporte, ejecuta el script: <code className="bg-yellow-200 px-1 rounded">docs/sql/add_auditoria_permission.sql</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  }
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Icono y título */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-14 h-14 ${reporte.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${reporte.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {reporte.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reporte.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Botón para mostrar/ocultar filtros */}
                    {reporte.hasFilters && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFilters('auditoria')}
                        className="w-full mb-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all"
                      >
                        <Filter className="w-4 h-4" />
                        <span>{showFilters['auditoria'] ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                      </motion.button>
                    )}

                    {/* Filtros de Auditoría */}
                    {reporte.hasFilters && showFilters['auditoria'] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Filtros de búsqueda</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fecha Desde */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Desde
                            </label>
                            <input
                              type="date"
                              value={auditoriaFilters.fecha_desde}
                              onChange={(e) => setAuditoriaFilters({ ...auditoriaFilters, fecha_desde: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>

                          {/* Fecha Hasta */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Hasta
                            </label>
                            <input
                              type="date"
                              value={auditoriaFilters.fecha_hasta}
                              onChange={(e) => setAuditoriaFilters({ ...auditoriaFilters, fecha_hasta: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>

                          {/* Tipo de Acción */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipo de Acción
                            </label>
                            <select
                              value={auditoriaFilters.accion}
                              onChange={(e) => setAuditoriaFilters({ ...auditoriaFilters, accion: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            >
                              <option value="">Todas las acciones</option>
                              <option value="INSERT">Creación</option>
                              <option value="UPDATE">Modificación</option>
                              <option value="DELETE">Eliminación</option>
                            </select>
                          </div>

                          {/* Entidad */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Entidad
                            </label>
                            <select
                              value={auditoriaFilters.tabla}
                              onChange={(e) => setAuditoriaFilters({ ...auditoriaFilters, tabla: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            >
                              <option value="">Todas las entidades</option>
                              <option value="roles">Roles</option>
                              <option value="perfiles">Perfiles/Usuarios</option>
                              <option value="permisos">Permisos</option>
                              <option value="rol_permisos">Permisos de Roles</option>
                              <option value="turnos">Turnos</option>
                              <option value="pedidos">Pedidos</option>
                              <option value="productos">Productos</option>
                              <option value="servicios">Servicios</option>
                              <option value="pedido_productos">Detalle de Pedidos</option>
                            </select>
                          </div>
                        </div>

                        {/* Botón limpiar filtros */}
                        <button
                          onClick={limpiarFiltrosAuditoria}
                          className="mt-3 text-xs text-slate-600 hover:text-slate-800 font-medium"
                        >
                          Limpiar filtros
                        </button>
                      </motion.div>
                    )}

                    {/* Botón de exportación */}
                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      onClick={reporte.onClick}
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r ${reporte.color} text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Exportando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Exportar Auditoría</span>
                        </>
                      )}
                    </motion.button>

                    {/* Formato del archivo */}
                    <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      <span>Formato: XLSX (Excel)</span>
                    </div>
                  </motion.div>
                </PermissionGuard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-gray-700" />
          Información sobre las exportaciones
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span>Los archivos incluyen todos los registros activos del sistema</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span>Las fechas se formatean según la configuración regional (Argentina)</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span>Los archivos se pueden abrir con Microsoft Excel, Google Sheets o LibreOffice Calc</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            <span>El nombre del archivo incluye fecha y hora para facilitar el versionado</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReportesAdmin;

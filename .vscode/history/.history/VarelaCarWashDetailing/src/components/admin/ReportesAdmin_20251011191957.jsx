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
  ShoppingCart
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
  formatUnidadesVendidasParaExcel
} from '@/lib/exportUtils';

/**
 * Componente para gestionar y exportar reportes del sistema
 * Permite exportar productos, servicios, turnos y pedidos a Excel
 */
const ReportesAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({});

  /**
   * Establece el estado de carga para un reporte específico
   */
  const setReportLoading = (reportName, isLoading) => {
    setLoading(prev => ({ ...prev, [reportName]: isLoading }));
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
      const { data: turnosData, error: turnosError } = await supabase
        .from('turnos')
        .select(`
          *,
          servicios (
            nombre,
            precio
          )
        `)
        .order('created_at', { ascending: false });

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
      const { data, error } = await supabase
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
        `)
        .order('created_at', { ascending: false });

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

      // Obtener fecha de hace 30 días
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);

      const { data: turnos, error } = await supabase
        .from('turnos')
        .select(`
          *,
          servicios (precio)
        `)
        .gte('fecha', fechaInicio.toISOString().split('T')[0])
        .order('fecha', { ascending: true });

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
      const { data: turnos, error } = await supabase
        .from('turnos')
        .select(`
          *,
          servicios (
            id_servicio,
            nombre,
            precio
          )
        `)
        .order('created_at', { ascending: false });

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

      // Obtener turnos realizados
      const { data: turnos, error: turnosError } = await supabase
        .from('turnos')
        .select(`
          *,
          servicios (precio)
        `)
        .eq('estado', 'Realizado')
        .order('fecha', { ascending: true });

      if (turnosError) throw turnosError;

      // Obtener pedidos pagados
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('estado_pago', 'Pagado')
        .order('fecha_pedido', { ascending: true });

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

      // Obtener fecha del primer día del mes
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const diasDelMes = Math.ceil((hoy - primerDiaMes) / (1000 * 60 * 60 * 24)) || 1;

      // Obtener pedidos del mes
      const { data: pedidos, error: pedidosError } = await supabase
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
        .gte('fecha_pedido', primerDiaMes.toISOString())
        .order('fecha_pedido', { ascending: false });

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
        const promedioDiario = (producto.unidadesVendidas / diasDelMes).toFixed(2);
        
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
   * Configuración de reportes disponibles
   */
  const reportes = [
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportes.map((reporte, index) => {
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

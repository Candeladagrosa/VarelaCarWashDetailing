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
  Info
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import PermissionGuard from '@/components/PermissionGuard';
import {
  exportToExcel,
  formatProductosParaExcel,
  formatServiciosParaExcel,
  formatTurnosParaExcel,
  formatPedidosParaExcel
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

      const { data, error } = await supabase
        .from('turnos')
        .select(`
          *,
          usuarios:id_usuario(nombre_completo, email),
          servicios:id_servicio(nombre, precio)
        `)
        .order('fecha_hora', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Sin datos',
          description: 'No hay turnos para exportar',
        });
        return;
      }

      const formatted = formatTurnosParaExcel(data);
      const success = exportToExcel(formatted, 'Turnos', 'Turnos');

      if (success) {
        toast({
          title: 'Exportación exitosa',
          description: `Se exportaron ${data.length} turnos correctamente`,
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

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          usuarios:id_usuario(nombre_completo, email),
          pedido_detalles(*)
        `)
        .order('fecha_pedido', { ascending: false });

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

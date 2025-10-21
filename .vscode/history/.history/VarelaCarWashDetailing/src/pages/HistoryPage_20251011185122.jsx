import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/customSupabaseClient';
import { Clock, Package, Calendar, DollarSign, Search, Filter, Loader2 } from 'lucide-react';

/**
 * Página de historial para clientes
 * Permite a los usuarios ver su historial de turnos y pedidos
 */
export default function HistoryPage() {
  const { user, profile } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('turnos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  /**
   * Carga el historial de turnos y pedidos del usuario actual
   */
  const loadHistory = async () => {
    try {
      setLoading(true);

      console.log('=== DEBUG HISTORIAL ===');
      console.log('Usuario actual (user.id):', user.id);
      console.log('Perfil actual:', profile);

      // Cargar turnos del usuario
      console.log('Consultando turnos...');
      const { data: turnosData, error: turnosError } = await supabase
        .from('turnos')
        .select(`
          id_turno,
          id_cliente,
          id_servicio,
          fecha,
          hora,
          estado,
          created_at,
          updated_at,
          servicios (
            id_servicio,
            nombre,
            precio,
            descripcion
          )
        `)
        .eq('id_cliente', user.id)
        .order('fecha', { ascending: false });

      if (turnosError) {
        console.error('❌ Error cargando turnos:', turnosError);
        console.error('Detalles del error:', JSON.stringify(turnosError, null, 2));
      } else {
        console.log('✅ Turnos cargados:', turnosData);
        console.log('Cantidad de turnos:', turnosData?.length || 0);
        if (turnosData && turnosData.length > 0) {
          console.log('Primer turno:', JSON.stringify(turnosData[0], null, 2));
        }
      }

      // Cargar pedidos del usuario
      console.log('Consultando pedidos...');
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_productos (
            id_pedido_producto,
            cantidad,
            precio,
            productos:id_producto (
              id_producto,
              nombre,
              imagen_url
            )
          )
        `)
        .eq('id_cliente', user.id)
        .order('fecha_pedido', { ascending: false });

      if (pedidosError) {
        console.error('❌ Error cargando pedidos:', pedidosError);
        console.error('Detalles del error:', JSON.stringify(pedidosError, null, 2));
      } else {
        console.log('✅ Pedidos cargados:', pedidosData);
        console.log('Cantidad de pedidos:', pedidosData?.length || 0);
        if (pedidosData && pedidosData.length > 0) {
          console.log('Primer pedido:', JSON.stringify(pedidosData[0], null, 2));
        }
      }

      console.log('=== FIN DEBUG ===');

      setTurnos(turnosData || []);
      setPedidos(pedidosData || []);
    } catch (error) {
      console.error('💥 Error general al cargar historial:', error);
      console.error('Stack trace:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene el color del badge según el estado
   */
  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmado: 'bg-blue-100 text-blue-700 border-blue-300',
      completado: 'bg-green-100 text-green-700 border-green-300',
      cancelado: 'bg-red-100 text-red-700 border-red-300',
      en_preparacion: 'bg-purple-100 text-purple-700 border-purple-300',
      enviado: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      entregado: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  /**
   * Formatea la fecha en formato legible
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Formatea la hora
   */
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // timeString viene como "HH:MM:SS" de PostgreSQL
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  /**
   * Filtra turnos según búsqueda y filtro de estado
   */
  const getFilteredTurnos = () => {
    let _filtered = turnos;

    // Filtrar por estado
    if (filterStatus !== 'all') {
      _filtered = _filtered.filter(_turno => _turno.estado === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      _filtered = _filtered.filter(_turno =>
        _turno.servicios?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        _turno.servicios?.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return _filtered;
  };

  /**
   * Filtra pedidos según búsqueda y filtro de estado
   */
  const getFilteredPedidos = () => {
    let _filtered = pedidos;

    // Filtrar por estado de pago o envío
    if (filterStatus !== 'all') {
      _filtered = _filtered.filter(_pedido =>
        _pedido.estado_pago === filterStatus || _pedido.estado_envio === filterStatus
      );
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      _filtered = _filtered.filter(_pedido =>
        _pedido.pedido_productos?.some(_pp =>
          _pp.productos?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        _pedido.direccion_envio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return _filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <div className="text-gray-700 text-xl">Cargando historial...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent mb-2">
            Mi Historial
          </h1>
          <p className="text-gray-600">Consulta tus turnos y pedidos anteriores</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'turnos'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Clock className="inline-block w-5 h-5 mr-2" />
            Turnos ({turnos.length})
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pedidos'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Package className="inline-block w-5 h-5 mr-2" />
            Pedidos ({pedidos.length})
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'turnos' ? 'Buscar por servicio...' : 'Buscar por producto...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Filtro de estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              {activeTab === 'turnos' ? (
                <>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </>
              ) : (
                <>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_preparacion">En Preparación</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Listado de Turnos */}
        {activeTab === 'turnos' && (
          <div className="space-y-4">
            {getFilteredTurnos().length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron turnos</p>
              </div>
            ) : (
              getFilteredTurnos().map((_turno) => (
                <motion.div
                  key={_turno.id_turno}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white backdrop-blur-lg border border-gray-200 rounded-xl p-6 hover:border-red-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {_turno.servicios?.nombre || 'Servicio'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(_turno.estado)}`}>
                          {_turno.estado}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(_turno.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Hora: {formatTime(_turno.hora)}</span>
                        </div>
                        {_turno.servicios?.descripcion && (
                          <p className="text-sm mt-2">
                            <strong className="text-gray-900">Descripción:</strong> {_turno.servicios.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        ${_turno.servicios?.precio?.toLocaleString('es-AR') || '0'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Total
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Listado de Pedidos */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {getFilteredPedidos().length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron pedidos</p>
              </div>
            ) : (
              getFilteredPedidos().map((_pedido) => (
                <motion.div
                  key={_pedido.id_pedido}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white backdrop-blur-lg border border-gray-200 rounded-xl p-6 hover:border-red-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header del pedido */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Pedido #{_pedido.id_pedido}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(_pedido.fecha_pedido)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(_pedido.estado_pago)}`}>
                          Pago: {_pedido.estado_pago}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(_pedido.estado_envio)}`}>
                          Envío: {_pedido.estado_envio}
                        </span>
                      </div>
                    </div>

                    {/* Productos del pedido */}
                    <div className="space-y-2">
                      {_pedido.pedido_productos?.map((_pp, idx) => (
                        <div
                          key={_pp.id_pedido_producto}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {_pp.productos?.imagen_url && (
                            <img
                              src={_pp.productos.imagen_url}
                              alt={_pp.productos.nombre}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium">
                              {_pp.productos?.nombre || 'Producto'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Cantidad: {_pp.cantidad} x ${_pp.precio?.toLocaleString('es-AR')}
                            </div>
                          </div>
                          <div className="text-red-600 font-semibold">
                            ${(_pp.cantidad * _pp.precio)?.toLocaleString('es-AR')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Información de envío y total */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="text-gray-600 text-sm">
                        {_pedido.cliente_data?.direccion && (
                          <>
                            <strong className="text-gray-900">Dirección de envío:</strong>
                            <div className="mt-1">{_pedido.cliente_data.direccion}</div>
                          </>
                        )}
                        {_pedido.cliente_data?.telefono && (
                          <div className="mt-2">
                            <strong className="text-gray-900">Teléfono:</strong> {_pedido.cliente_data.telefono}
                          </div>
                        )}
                        {_pedido.cliente_data?.metodo_pago && (
                          <div className="mt-2">
                            <strong className="text-gray-900">Método de pago:</strong> {_pedido.cliente_data.metodo_pago}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Total del pedido</div>
                        <div className="text-3xl font-bold text-red-600">
                          ${_pedido.total?.toLocaleString('es-AR') || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

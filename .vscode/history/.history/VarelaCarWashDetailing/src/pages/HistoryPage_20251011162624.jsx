import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/customSupabaseClient';
import { Clock, Package, Calendar, DollarSign, Search, Filter } from 'lucide-react';

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

      // Cargar turnos del usuario
      const { data: turnosData, error: turnosError } = await supabase
        .from('turnos')
        .select(`
          *,
          servicios (
            nombre,
            precio,
            duracion_estimada
          )
        `)
        .eq('id_usuario', user.id)
        .order('fecha', { ascending: false });

      if (turnosError) throw turnosError;

      // Cargar pedidos del usuario
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedidos_productos (
            cantidad,
            precio_unitario,
            productos (
              nombre,
              imagen_url
            )
          )
        `)
        .eq('id_usuario', user.id)
        .order('fecha', { ascending: false });

      if (pedidosError) throw pedidosError;

      setTurnos(turnosData || []);
      setPedidos(pedidosData || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene el color del badge según el estado
   */
  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      confirmado: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completado: 'bg-green-500/20 text-green-300 border-green-500/30',
      cancelado: 'bg-red-500/20 text-red-300 border-red-500/30',
      en_preparacion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      enviado: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      entregado: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[estado] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  /**
   * Formatea la fecha en formato legible
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        _turno.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
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
        _pedido.pedidos_productos?.some(_pp =>
          _pp.productos?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        _pedido.direccion_envio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return _filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Mi Historial</h1>
          <p className="text-gray-400">Consulta tus turnos y pedidos anteriores</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'turnos'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Clock className="inline-block w-5 h-5 mr-2" />
            Turnos ({turnos.length})
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pedidos'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filtro de estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
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
              <div className="text-center py-12 text-gray-400">
                No se encontraron turnos
              </div>
            ) : (
              getFilteredTurnos().map((_turno) => (
                <motion.div
                  key={_turno.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {_turno.servicios?.nombre || 'Servicio'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(_turno.estado)}`}>
                          {_turno.estado}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(_turno.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Duración: {_turno.servicios?.duracion_estimada || '-'} min</span>
                        </div>
                        {_turno.observaciones && (
                          <p className="text-sm mt-2">
                            <strong>Observaciones:</strong> {_turno.observaciones}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-500">
                        ${_turno.servicios?.precio?.toLocaleString('es-AR') || '0'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
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
              <div className="text-center py-12 text-gray-400">
                No se encontraron pedidos
              </div>
            ) : (
              getFilteredPedidos().map((_pedido) => (
                <motion.div
                  key={_pedido.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header del pedido */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Pedido #{_pedido.id}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(_pedido.fecha)}</span>
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
                      {_pedido.pedidos_productos?.map((_pp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                        >
                          {_pp.productos?.imagen_url && (
                            <img
                              src={_pp.productos.imagen_url}
                              alt={_pp.productos.nombre}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {_pp.productos?.nombre || 'Producto'}
                            </div>
                            <div className="text-sm text-gray-400">
                              Cantidad: {_pp.cantidad} x ${_pp.precio_unitario?.toLocaleString('es-AR')}
                            </div>
                          </div>
                          <div className="text-orange-500 font-semibold">
                            ${(_pp.cantidad * _pp.precio_unitario)?.toLocaleString('es-AR')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Información de envío y total */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="text-gray-400 text-sm">
                        <strong>Dirección de envío:</strong>
                        <div className="mt-1">{_pedido.direccion_envio || 'No especificada'}</div>
                        {_pedido.metodo_pago && (
                          <div className="mt-2">
                            <strong>Método de pago:</strong> {_pedido.metodo_pago}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Total del pedido</div>
                        <div className="text-3xl font-bold text-orange-500">
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

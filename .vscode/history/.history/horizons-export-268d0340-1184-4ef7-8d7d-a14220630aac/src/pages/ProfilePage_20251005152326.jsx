import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Calendar, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        
        const [profileRes, turnosRes, pedidosRes] = await Promise.all([
          supabase.from('perfiles').select('*').eq('id', user.id).single(),
          supabase.from('turnos').select('*, servicios(nombre)').eq('id_cliente', user.id),
          supabase.from('pedidos').select('*, pedido_productos(*, productos(nombre))').eq('id_cliente', user.id)
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (turnosRes.data) setTurnos(turnosRes.data);
        if (pedidosRes.data) setPedidos(pedidosRes.data);
        
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <Helmet>
        <title>Mi Perfil - Varela Car Wash & Detailing</title>
        <meta name="description" content="Gestiona tu perfil, revisa tus turnos reservados y el historial de compras en Varela Car Wash." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                  {profile.nombre} {profile.apellido}
                </h1>
                <p className="text-gray-600 text-lg">{user.email}</p>
                <p className="text-gray-500">DNI: {profile.dni}</p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="turnos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 glass-effect p-2">
              <TabsTrigger value="turnos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-700 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Mis Turnos
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-700 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mis Compras
              </TabsTrigger>
            </TabsList>

            <TabsContent value="turnos" className="space-y-4">
              {turnos.length === 0 ? (
                <div className="glass-effect rounded-2xl p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No tienes turnos reservados</p>
                </div>
              ) : (
                turnos.map((turno, index) => (
                    <motion.div
                      key={turno.id_turno}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {turno.servicios?.nombre || 'Servicio'}
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(turno.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{turno.hora}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-semibold ${
                          turno.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          turno.estado === 'Confirmado' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {turno.estado}
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="pedidos" className="space-y-4">
              {pedidos.length === 0 ? (
                <div className="glass-effect rounded-2xl p-12 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">No tienes compras realizadas</p>
                </div>
              ) : (
                pedidos.map((pedido, index) => (
                  <motion.div
                    key={pedido.id_pedido}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          Pedido #{pedido.id_pedido}
                        </h3>
                        <p className="text-gray-600">
                          {new Date(pedido.fecha_pedido).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold gradient-text">
                          ${pedido.total.toLocaleString()}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pedido.estado_pago === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pedido.estado_pago}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pedido.estado_envio === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pedido.estado_envio}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Productos:</h4>
                      <ul className="space-y-1">
                        {pedido.pedido_productos.map((prod, idx) => (
                          <li key={idx} className="text-gray-600">
                            {prod.cantidad}x {prod.productos.nombre} - ${prod.precio.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
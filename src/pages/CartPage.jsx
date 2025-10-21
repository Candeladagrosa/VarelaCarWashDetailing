import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import CheckoutModal from '@/components/CheckoutModal';
import { supabase } from '@/lib/customSupabaseClient';

const CartPage = ({ cart, updateQuantity, removeFromCart, clearCart, user, setCurrentPage }) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.precio_actual * item.cantidad, 0);

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: '¡Atención!',
        description: 'Debes iniciar sesión para realizar la compra',
        variant: 'destructive',
      });
      setCurrentPage('login');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmOrder = async (customerData) => {
    setLoading(true);
    
    try {
      // 1. Crear el pedido principal
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          id_cliente: user.id,
          total: total,
          estado_pago: 'Pendiente',
          estado_envio: 'Pendiente',
          cliente_data: customerData
        }])
        .select()
        .single();

      if (pedidoError) {
        console.error('Error creando pedido:', pedidoError);
        toast({
          title: 'Error',
          description: 'No se pudo crear el pedido. Intenta nuevamente.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // 2. Crear los productos del pedido
      const productosParaInsertar = cart.map(item => ({
        id_pedido: pedidoData.id_pedido,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio: item.precio_actual
      }));

      const { error: productosError } = await supabase
        .from('pedido_productos')
        .insert(productosParaInsertar);

      if (productosError) {
        console.error('Error agregando productos al pedido:', productosError);
        // Rollback: eliminar el pedido creado
        await supabase
          .from('pedidos')
          .delete()
          .eq('id_pedido', pedidoData.id_pedido);
        
        toast({
          title: 'Error',
          description: 'No se pudieron agregar los productos al pedido.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // 3. Todo OK - limpiar carrito y mostrar éxito
      toast({
        title: '¡Pedido Realizado! 🎉',
        description: 'Tu pedido ha sido procesado exitosamente',
      });

      clearCart();
      setShowCheckoutModal(false);
      setLoading(false);
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Carrito - Varela Car Wash & Detailing</title>
        <meta name="description" content="Revisa tu carrito de compras y finaliza tu pedido de productos premium para el cuidado automotor." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
              Tu Carrito
            </h1>
          </motion.div>

          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-effect rounded-2xl"
            >
              <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
              <p className="text-2xl text-gray-500 mb-6">
                Tu carrito está vacío
              </p>
              <Button
                onClick={() => setCurrentPage('products')}
                className="bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
              >
                Ver Productos
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id_producto}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {item.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.descripcion}
                    </p>
                    <p className="text-2xl font-bold gradient-text">
                      ${item.precio_actual.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id_producto)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-8 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-gray-800">Total:</span>
                  <span className="text-4xl font-bold gradient-text">
                    ${total.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="flex-1"
                  >
                    Vaciar Carrito
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Finalizar Compra'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
        {showCheckoutModal && (
          <CheckoutModal
            user={user}
            onClose={() => setShowCheckoutModal(false)}
            onConfirm={handleConfirmOrder}
          />
        )}
      </div>
    </>
  );
};

export default CartPage;
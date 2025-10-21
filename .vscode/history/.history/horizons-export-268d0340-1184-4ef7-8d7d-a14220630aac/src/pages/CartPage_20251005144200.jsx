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

  const handleConfirmOrder = (customerData) => {
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const newPedido = {
      id_pedido: pedidos.length + 1,
      id_cliente: user.id_usuario,
      cliente_data: customerData,
      fecha_pedido: new Date().toISOString(),
      total: total,
      estado_pago: 'Pendiente',
      estado_envio: 'Pendiente',
      productos: cart.map(item => ({
        id_producto: item.id_producto,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio_actual,
      })),
    };

    pedidos.push(newPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    toast({
      title: '¡Pedido Realizado! 🎉',
      description: 'Tu pedido ha sido procesado exitosamente',
    });

    clearCart();
    setShowCheckoutModal(false);
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
                  >
                    Finalizar Compra
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
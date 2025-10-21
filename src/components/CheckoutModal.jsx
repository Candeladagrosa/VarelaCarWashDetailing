import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CheckoutModal = ({ user, onClose, onConfirm }) => {
  const [customerData, setCustomerData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (user) {
      setCustomerData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerData.nombre || !customerData.email || !customerData.telefono || !customerData.direccion) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    onConfirm(customerData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-effect rounded-2xl p-8 max-w-lg w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold gradient-text">Confirmar Pedido</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Nombre</span>
                </label>
                <input type="text" name="nombre" value={customerData.nombre} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Apellido</span>
                </label>
                <input type="text" name="apellido" value={customerData.apellido} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input type="email" name="email" value={customerData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Teléfono</span>
              </label>
              <input type="tel" name="telefono" value={customerData.telefono} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Dirección de Envío</span>
              </label>
              <input type="text" name="direccion" value={customerData.direccion} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="Calle, Número, Ciudad, Provincia" required />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white">
                Confirmar Pedido
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
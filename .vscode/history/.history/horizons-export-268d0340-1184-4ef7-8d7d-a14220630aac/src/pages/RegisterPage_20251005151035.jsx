
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const RegisterPage = ({ onRegister, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === formData.email)) {
      toast({
        title: 'Error',
        description: 'Este email ya está registrado',
        variant: 'destructive',
      });
      return;
    }

    if (users.find(u => u.dni === parseInt(formData.dni))) {
      toast({
        title: 'Error',
        description: 'Este DNI ya está registrado',
        variant: 'destructive',
      });
      return;
    }

    const newUser = {
      id_usuario: users.length + 1,
      id_rol: 2,
      ...formData,
      dni: parseInt(formData.dni),
      estado: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    onRegister(newUser);
    toast({
      title: '¡Registro Exitoso! 🎉',
      description: 'Tu cuenta ha sido creada correctamente',
    });
  };

  return (
    <>
      <Helmet>
        <title>Registro - Varela Car Wash & Detailing</title>
        <meta name="description" content="Crea tu cuenta en Varela Car Wash para acceder a todos nuestros servicios y productos premium." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <UserPlus className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-600">
              Únete a nuestra comunidad
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Nombre</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Apellido</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>DNI</span>
                </label>
                <input
                  type="number"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Teléfono</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Contraseña</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-purple-600 font-semibold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
  
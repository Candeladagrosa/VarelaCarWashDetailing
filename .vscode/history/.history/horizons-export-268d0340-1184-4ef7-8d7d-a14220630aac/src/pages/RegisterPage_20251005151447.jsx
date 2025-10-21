
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const RegisterPage = ({ onRegister, setCurrentPage }) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificar si el DNI ya existe en perfiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('perfiles')
        .select('dni')
        .eq('dni', parseInt(formData.dni))
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: 'Error',
          description: 'Este DNI ya está registrado',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 2. Crear usuario en auth.users con signUp (sin mostrar toast automático)
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
        },
        false // No mostrar toast automático
      );

      if (authError) {
        console.error('Error en signUp:', authError);
        toast({
          title: 'Error en el registro',
          description: authError.message || 'No se pudo crear la cuenta. Por favor, intenta nuevamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        toast({
          title: 'Error',
          description: 'No se pudo crear el usuario. Por favor, intenta nuevamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 3. Crear perfil en tabla perfiles
      const { error: profileError } = await supabase
        .from('perfiles')
        .insert([
          {
            id: authData.user.id,
            id_rol: 2, // rol cliente
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: parseInt(formData.dni),
            telefono: formData.telefono,
            estado: true,
          }
        ]);

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        
        toast({
          title: 'Error',
          description: 'No se pudo completar el registro del perfil. Por favor, contacta al administrador.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 4. Registro exitoso
      toast({
        title: '¡Registro Exitoso! 🎉',
        description: 'Tu cuenta ha sido creada correctamente. Por favor, verifica tu email para activarla.',
      });

      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
      });

      // Opcional: redirigir a login después de 2 segundos
      setTimeout(() => {
        setCurrentPage('login');
      }, 2000);

    } catch (error) {
      console.error('Error en registro:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
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
  

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getSupabaseErrorMessage } from '@/lib/errorTranslations';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  // Validaciones de contraseña
  const passwordValidations = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = formData.password === confirmPassword && formData.password !== '';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseña antes de continuar
    if (!isPasswordValid) {
      toast({
        title: 'Contraseña inválida',
        description: 'La contraseña no cumple con los requisitos de seguridad',
        variant: 'destructive',
      });
      return;
    }

    // Validar que las contraseñas coincidan
    if (!passwordsMatch) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Por favor verifica que ambas contraseñas sean iguales',
        variant: 'destructive',
      });
      return;
    }

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
          dni: parseInt(formData.dni),
          telefono: formData.telefono
        },
        false // No mostrar toast automático
      );

      if (authError) {
        console.error('Error en signUp:', authError);
        const errorMsg = getSupabaseErrorMessage(authError);
        toast({
          title: errorMsg.title,
          description: errorMsg.description,
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

      // Comento esta seccion ya que la creacion del perfil se hace automaticamente con un trigger en la base de datos (en paso 1. signUp())
      // 3. Crear perfil en tabla perfiles usando función RPC
      // const { error: profileError } = await supabase.rpc('create_profile', {
      //   user_id: authData.user.id,
      //   user_nombre: formData.nombre,
      //   user_apellido: formData.apellido,
      //   user_dni: parseInt(formData.dni),
      //   user_telefono: formData.telefono
      // });

      // if (profileError) {
      //   console.error('Error creando perfil:', profileError);
        
      //   toast({
      //     title: 'Error',
      //     description: 'No se pudo completar el registro del perfil. Por favor, contacta al administrador.',
      //     variant: 'destructive',
      //   });
      //   setLoading(false);
      //   return;
      // }

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
      setConfirmPassword('');

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error en registro:', error);
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
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
              className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
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
            {/* Grid para Nombre, Apellido, DNI, Teléfono */}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email - Full Width */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Contraseña - Full Width */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Validaciones de contraseña */}
            {formData.password && (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">La contraseña debe contener:</p>
                <div className="space-y-1">
                  <ValidationItem
                    valid={passwordValidations.minLength}
                    text="Mínimo 8 caracteres"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasUpperCase}
                    text="Al menos una letra mayúscula"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasLowerCase}
                    text="Al menos una letra minúscula"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasNumber}
                    text="Al menos un número"
                  />
                  <ValidationItem
                    valid={passwordValidations.hasSpecialChar}
                    text="Al menos un carácter especial (!@#$%^&*)"
                  />
                </div>
              </div>
            )}

            {/* Confirmar Contraseña - Full Width */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Confirmar Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Las contraseñas no coinciden
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Las contraseñas coinciden
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => navigate('/login')}
                className="text-red-700 font-semibold hover:underline"
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

// Componente auxiliar para mostrar validaciones
const ValidationItem = ({ valid, text }) => (
  <div className={`flex items-center space-x-2 ${valid ? 'text-green-600' : 'text-gray-400'}`}>
    {valid ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-current" />
    )}
    <span>{text}</span>
  </div>
);

export default RegisterPage;
  
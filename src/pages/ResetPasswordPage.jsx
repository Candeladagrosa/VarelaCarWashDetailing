import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseErrorMessage } from '@/lib/errorTranslations';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Validaciones de contraseña
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = password === confirmPassword && password !== '';

  useEffect(() => {
    // Verificar si hay un token de recuperación válido
    const checkRecoveryToken = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          const errorMsg = getSupabaseErrorMessage(error);
          toast({
            variant: 'destructive',
            title: errorMsg.title,
            description: errorMsg.description,
          });
          setValidToken(false);
          setCheckingToken(false);
          return;
        }

        if (session) {
          setValidToken(true);
        } else {
          setValidToken(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        const errorMsg = getSupabaseErrorMessage(error);
        toast({
          variant: 'destructive',
          title: errorMsg.title,
          description: errorMsg.description,
        });
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: 'Contraseña inválida',
        description: 'La contraseña no cumple con los requisitos de seguridad',
        variant: 'destructive',
      });
      return;
    }

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
      const { error } = await updatePassword(password);

      if (error) {
        const errorMsg = getSupabaseErrorMessage(error);
        toast({
          variant: 'destructive',
          title: errorMsg.title,
          description: errorMsg.description,
        });
        setLoading(false);
        return;
      }

      // Éxito - el toast ya se muestra en updatePassword del contexto
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error en resetPassword:', error);
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        variant: 'destructive',
        title: errorMsg.title,
        description: errorMsg.description,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <>
        <Helmet>
          <title>Enlace Inválido - Varela Car Wash & Detailing</title>
        </Helmet>

        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <AlertCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-3xl font-bold mb-4">
                Enlace Inválido o Expirado
              </h1>

              <p className="text-gray-600 mb-6">
                El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.
              </p>

              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
              >
                Solicitar Nuevo Enlace
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Restablecer Contraseña - Varela Car Wash & Detailing</title>
        <meta name="description" content="Establece una nueva contraseña para tu cuenta." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600">
              Establece una contraseña segura para tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Nueva Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            {password && (
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

            {/* Confirmar Contraseña */}
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
              className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </Button>
          </form>
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

export default ResetPasswordPage;

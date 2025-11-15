import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);
    
    if (!error) {
      setEmailSent(true);
    }
    
    setLoading(false);
  };

  if (emailSent) {
    return (
      <>
        <Helmet>
          <title>Email Enviado - Varela Car Wash & Detailing</title>
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
                className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-3xl font-bold mb-4">
                Revisa tu correo
              </h1>

              <p className="text-gray-600 mb-6">
                Si la cuenta existe, recibirás las instrucciones en <strong>{email}</strong> en breve.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Próximos pasos:</strong>
                </p>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Si no llega, verifica que hayas ingresado el email correcto</li>
                  <li>Haz clic en el enlace del correo</li>
                  <li>Establece tu nueva contraseña</li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Si no recibes el correo en unos minutos, revisa tu spam. Por motivos de seguridad, no confirmamos si el email está registrado.
              </p>

              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Recuperar Contraseña - Varela Car Wash & Detailing</title>
        <meta name="description" content="Recupera tu contraseña de Varela Car Wash & Detailing." />
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
              <Mail className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              ¿Olvidaste tu Contraseña?
            </h1>
            <p className="text-gray-600">
              Ingresa tu email y te enviaremos un enlace para recuperarla
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 py-6 text-lg"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-gray-600 hover:text-red-600 font-medium inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio de Sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Shield, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Navbar = ({ profile, cartItemsCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: mostrar el perfil en consola cuando cambie
  useEffect(() => {
    if (profile) {
      console.log('Navbar - Perfil recibido:', profile);
    }
  }, [profile]);

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/services', label: 'Servicios' },
    { path: '/products', label: 'Productos' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-xl">VCW</span>
            </motion.div>
            <span className="text-2xl font-bold gradient-text hidden sm:block">
              Varela Car Wash
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-lg font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-red-600'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {item.label}
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-700 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.button>
            </Link>

            {user ? (
              <>
                {profile?.id_rol === 1 && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/history')}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>Historial</span>
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  {profile ? (
                    <span>{profile.nombre}</span>
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="hidden md:block bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
              >
                Iniciar Sesión
              </Button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  {profile?.id_rol === 1 && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-2"
                  >
                    {profile ? (
                      <span>Mi Perfil - {profile.nombre}</span>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando...</span>
                      </>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-500 text-white"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
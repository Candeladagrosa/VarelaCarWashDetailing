import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * Componente para proteger rutas según permisos
 * 
 * Controla el acceso a rutas completas basándose en los permisos del usuario.
 * Si el usuario no tiene permisos, redirige o muestra un mensaje de acceso denegado.
 * 
 * @example
 * // Proteger con un solo permiso
 * <Route path="/admin/productos" element={
 *   <ProtectedRoute permission="productos.ver_listado">
 *     <ProductsAdmin />
 *   </ProtectedRoute>
 * } />
 * 
 * @example
 * // Proteger con múltiples permisos (al menos uno)
 * <Route path="/admin/ventas" element={
 *   <ProtectedRoute permissions={["turnos.ver_listado", "pedidos.ver_listado"]}>
 *     <VentasPanel />
 *   </ProtectedRoute>
 * } />
 * 
 * @example
 * // Proteger con todos los permisos requeridos
 * <Route path="/admin/configuracion" element={
 *   <ProtectedRoute permissions={["roles.editar", "permisos.asignar"]} requireAll={true}>
 *     <ConfigPanel />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  redirectTo = '/',
  showAccessDenied = true,
}) => {
  const { user, loading: authLoading } = useAuth();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading: permissionsLoading,
  } = usePermissions();

  // Si está cargando la autenticación o los permisos, mostrar loader
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando permisos...</p>
        </motion.div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determinar si el usuario tiene los permisos necesarios
  let hasAccess = false;

  if (permission) {
    // Verificar un solo permiso
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    // Verificar múltiples permisos
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // Si no se especifica ningún permiso, permitir acceso
    console.warn('ProtectedRoute: No se especificó ningún permiso, permitiendo acceso');
    hasAccess = true;
  }

  // Si no tiene acceso y se debe mostrar mensaje de acceso denegado
  if (!hasAccess && showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Acceso Denegado
            </h1>
            
            <p className="text-gray-300 mb-6">
              No tienes los permisos necesarios para acceder a esta sección.
            </p>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300">
                {permission && `Se requiere el permiso: ${permission}`}
                {permissions.length > 0 && requireAll && 
                  `Se requieren todos estos permisos: ${permissions.join(', ')}`}
                {permissions.length > 0 && !requireAll && 
                  `Se requiere al menos uno de estos permisos: ${permissions.join(', ')}`}
              </p>
            </div>

            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
            >
              Volver al Inicio
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  // Si no tiene acceso y no se debe mostrar mensaje, redirigir
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si tiene acceso, renderizar el contenido
  return <>{children}</>;
};

ProtectedRoute.propTypes = {
  /** Contenido a renderizar si el usuario tiene permisos */
  children: PropTypes.node.isRequired,
  
  /** Un solo permiso a verificar (ej: 'productos.crear') */
  permission: PropTypes.string,
  
  /** Array de permisos a verificar */
  permissions: PropTypes.arrayOf(PropTypes.string),
  
  /** Si true, requiere todos los permisos. Si false, requiere al menos uno */
  requireAll: PropTypes.bool,
  
  /** Ruta a la que redirigir si no tiene permisos y showAccessDenied es false */
  redirectTo: PropTypes.string,
  
  /** Si true, muestra un mensaje de acceso denegado. Si false, redirige */
  showAccessDenied: PropTypes.bool,
};

export default ProtectedRoute;

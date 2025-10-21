import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Componente para proteger elementos de la UI según permisos
 * 
 * Muestra u oculta elementos basándose en los permisos del usuario.
 * Útil para ocultar botones, secciones o cualquier elemento que requiera permisos.
 * 
 * @example
 * // Verificar un solo permiso
 * <PermissionGuard permission="productos.crear">
 *   <Button>Crear Producto</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Verificar múltiples permisos (al menos uno)
 * <PermissionGuard permissions={["productos.crear", "productos.editar"]} requireAll={false}>
 *   <Button>Gestionar Productos</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Verificar todos los permisos
 * <PermissionGuard permissions={["productos.crear", "productos.editar"]} requireAll={true}>
 *   <Button>Acción Especial</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Mostrar contenido alternativo si no tiene permiso
 * <PermissionGuard permission="productos.crear" fallback={<p>No tienes permisos</p>}>
 *   <Button>Crear Producto</Button>
 * </PermissionGuard>
 */
const PermissionGuard = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showLoading = false,
  loadingComponent = null,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
  } = usePermissions();

  // Si está cargando y showLoading es true, mostrar componente de carga
  if (loading && showLoading) {
    return loadingComponent || <div className="animate-pulse">Cargando...</div>;
  }

  // Si está cargando pero showLoading es false, no mostrar nada
  if (loading) {
    return null;
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
    // Si no se especifica ningún permiso, mostrar el contenido
    console.warn('PermissionGuard: No se especificó ningún permiso');
    hasAccess = true;
  }

  // Mostrar children si tiene acceso, fallback si no
  return hasAccess ? <>{children}</> : fallback;
};

PermissionGuard.propTypes = {
  /** Contenido a mostrar si el usuario tiene permisos */
  children: PropTypes.node.isRequired,
  
  /** Un solo permiso a verificar (ej: 'productos.crear') */
  permission: PropTypes.string,
  
  /** Array de permisos a verificar */
  permissions: PropTypes.arrayOf(PropTypes.string),
  
  /** Si true, requiere todos los permisos. Si false, requiere al menos uno */
  requireAll: PropTypes.bool,
  
  /** Contenido a mostrar si el usuario NO tiene permisos */
  fallback: PropTypes.node,
  
  /** Si true, muestra un componente mientras carga */
  showLoading: PropTypes.bool,
  
  /** Componente personalizado para mostrar mientras carga */
  loadingComponent: PropTypes.node,
};

export default PermissionGuard;

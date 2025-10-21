import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook para gestionar permisos del usuario actual
 * 
 * @returns {Object} Objeto con permisos y funciones de verificación
 * @returns {Array} permissions - Array de objetos con los permisos del usuario
 * @returns {boolean} loading - Indica si se están cargando los permisos
 * @returns {Function} hasPermission - Verifica si el usuario tiene un permiso específico
 * @returns {Function} hasAnyPermission - Verifica si el usuario tiene al menos uno de los permisos
 * @returns {Function} hasAllPermissions - Verifica si el usuario tiene todos los permisos
 * @returns {Function} canAccess - Verifica si el usuario puede acceder a un módulo
 * @returns {Function} refreshPermissions - Recarga los permisos del usuario
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Carga los permisos del usuario desde la base de datos
   */
  const loadPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Usar la función de base de datos para obtener permisos
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: user.id
      });

      if (error) {
        console.error('❌ Error cargando permisos:', error);
        setPermissions([]);
      } else {
        setPermissions(data || []);
        console.log('✅ Permisos cargados:', data?.length || 0, 'permisos');
      }
    } catch (error) {
      console.error('❌ Error en loadPermissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar permisos cuando el usuario cambia
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * 
   * @param {string} permissionCode - Código del permiso (ej: 'productos.crear')
   * @returns {boolean} true si tiene el permiso, false si no
   */
  const hasPermission = useCallback(
    (permissionCode) => {
      if (!permissionCode) return false;
      return permissions.some((p) => p.codigo_permiso === permissionCode);
    },
    [permissions]
  );

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * 
   * @param {Array<string>} permissionCodes - Array de códigos de permisos
   * @returns {boolean} true si tiene al menos uno, false si no
   */
  const hasAnyPermission = useCallback(
    (permissionCodes = []) => {
      if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        return false;
      }
      return permissionCodes.some((code) => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * 
   * @param {Array<string>} permissionCodes - Array de códigos de permisos
   * @returns {boolean} true si tiene todos, false si no
   */
  const hasAllPermissions = useCallback(
    (permissionCodes = []) => {
      if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        return false;
      }
      return permissionCodes.every((code) => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario puede acceder a un módulo
   * (tiene al menos un permiso en ese módulo)
   * 
   * @param {string} moduleName - Nombre del módulo (ej: 'productos')
   * @returns {boolean} true si puede acceder, false si no
   */
  const canAccess = useCallback(
    (moduleName) => {
      if (!moduleName) return false;
      return permissions.some((p) => p.modulo === moduleName);
    },
    [permissions]
  );

  /**
   * Obtiene todos los permisos de un módulo específico
   * 
   * @param {string} moduleName - Nombre del módulo
   * @returns {Array} Array de permisos del módulo
   */
  const getModulePermissions = useCallback(
    (moduleName) => {
      if (!moduleName) return [];
      return permissions.filter((p) => p.modulo === moduleName);
    },
    [permissions]
  );

  /**
   * Verifica si el usuario puede realizar una acción específica en un módulo
   * 
   * @param {string} moduleName - Nombre del módulo
   * @param {string} action - Acción a verificar
   * @returns {boolean} true si puede, false si no
   */
  const can = useCallback(
    (moduleName, action) => {
      if (!moduleName || !action) return false;
      const permissionCode = `${moduleName}.${action}`;
      return hasPermission(permissionCode);
    },
    [hasPermission]
  );

  /**
   * Recarga los permisos del usuario
   */
  const refreshPermissions = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    getModulePermissions,
    can,
    refreshPermissions,
  };
};

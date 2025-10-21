import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Loader2, Save, CheckCircle, XCircle, Info, Package, Wrench, Users, Calendar, ShoppingBag, Shield, FileText } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import PermissionGuard from '@/components/PermissionGuard';

/**
 * Componente para asignar permisos a roles
 * Interfaz visual para gestionar qué permisos tiene cada rol
 */
const PermissionsAdmin = () => {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [rolPermisos, setRolPermisos] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Iconos por módulo
  const moduleIcons = {
    productos: Package,
    servicios: Wrench,
    usuarios: Users,
    turnos: Calendar,
    pedidos: ShoppingBag,
    roles: Shield,
    auditoria: FileText,
  };

  /**
   * Carga roles, permisos y asignaciones
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar roles activos
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('activo', true)
        .order('id_rol');

      if (rolesError) throw rolesError;

      // Cargar todos los permisos
      const { data: permisosData, error: permisosError } = await supabase
        .from('permisos')
        .select('*')
        .order('modulo, accion');

      if (permisosError) throw permisosError;

      // Cargar asignaciones de permisos a roles
      const { data: asignacionesData, error: asignacionesError } = await supabase
        .from('rol_permisos')
        .select('id_rol, id_permiso');

      if (asignacionesError) throw asignacionesError;

      // Organizar asignaciones por rol
      const asignacionesPorRol = {};
      rolesData.forEach(role => {
        asignacionesPorRol[role.id_rol] = asignacionesData
          .filter(a => a.id_rol === role.id_rol)
          .map(a => a.id_permiso);
      });

      setRoles(rolesData || []);
      setPermisos(permisosData || []);
      setRolPermisos(asignacionesPorRol);

      // Seleccionar el primer rol por defecto
      if (rolesData && rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Agrupa permisos por módulo
   */
  const getPermisosPorModulo = () => {
    const grupos = {};
    permisos.forEach(permiso => {
      if (!grupos[permiso.modulo]) {
        grupos[permiso.modulo] = [];
      }
      grupos[permiso.modulo].push(permiso);
    });
    return grupos;
  };

  /**
   * Verifica si un rol tiene un permiso
   */
  const hasPermission = (roleId, permisoId) => {
    const changes = pendingChanges[roleId] || {};
    if (changes[permisoId] !== undefined) {
      return changes[permisoId];
    }
    return rolPermisos[roleId]?.includes(permisoId) || false;
  };

  /**
   * Alterna un permiso para el rol seleccionado
   */
  const togglePermission = (permisoId) => {
    if (!selectedRole) return;

    const roleId = selectedRole.id_rol;
    const currentValue = hasPermission(roleId, permisoId);
    
    setPendingChanges(prev => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [permisoId]: !currentValue,
      },
    }));
  };

  /**
   * Verifica si hay cambios pendientes
   */
  const hasPendingChanges = () => {
    return Object.keys(pendingChanges).some(roleId => 
      Object.keys(pendingChanges[roleId]).length > 0
    );
  };

  /**
   * Guarda los cambios pendientes
   */
  const handleSave = async () => {
    if (!hasPendingChanges()) return;

    try {
      setSaving(true);

      // Procesar cambios para cada rol
      for (const roleId in pendingChanges) {
        const changes = pendingChanges[roleId];
        
        for (const permisoId in changes) {
          const shouldHavePermission = changes[permisoId];
          const currentlyHas = rolPermisos[roleId]?.includes(parseInt(permisoId));

          if (shouldHavePermission && !currentlyHas) {
            // Agregar permiso
            const { error } = await supabase
              .from('rol_permisos')
              .insert({
                id_rol: parseInt(roleId),
                id_permiso: parseInt(permisoId),
              });

            if (error) throw error;
          } else if (!shouldHavePermission && currentlyHas) {
            // Remover permiso
            const { error } = await supabase
              .from('rol_permisos')
              .delete()
              .eq('id_rol', parseInt(roleId))
              .eq('id_permiso', parseInt(permisoId));

            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Permisos actualizados',
        description: 'Los permisos se han guardado correctamente',
      });

      // Limpiar cambios pendientes y recargar
      setPendingChanges({});
      await loadData();
    } catch (error) {
      console.error('Error guardando permisos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar los permisos',
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Descarta los cambios pendientes
   */
  const handleDiscard = () => {
    setPendingChanges({});
  };

  /**
   * Selecciona todos los permisos de un módulo
   */
  const selectAllModule = (modulo) => {
    if (!selectedRole) return;

    const roleId = selectedRole.id_rol;
    const permisosDelModulo = permisos.filter(p => p.modulo === modulo);
    
    const newChanges = { ...(pendingChanges[roleId] || {}) };
    permisosDelModulo.forEach(permiso => {
      newChanges[permiso.id_permiso] = true;
    });

    setPendingChanges(prev => ({
      ...prev,
      [roleId]: newChanges,
    }));
  };

  /**
   * Deselecciona todos los permisos de un módulo
   */
  const deselectAllModule = (modulo) => {
    if (!selectedRole) return;

    const roleId = selectedRole.id_rol;
    const permisosDelModulo = permisos.filter(p => p.modulo === modulo);
    
    const newChanges = { ...(pendingChanges[roleId] || {}) };
    permisosDelModulo.forEach(permiso => {
      newChanges[permiso.id_permiso] = false;
    });

    setPendingChanges(prev => ({
      ...prev,
      [roleId]: newChanges,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const permisosPorModulo = getPermisosPorModulo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Key className="w-6 h-6 mr-2 text-red-500" />
            Asignación de Permisos
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona los permisos de cada rol
          </p>
        </div>

        {hasPendingChanges() && (
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscard}
              disabled={saving}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Descartar
            </motion.button>

            <PermissionGuard permission="roles.asignar_permisos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </motion.button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Asignación de permisos</p>
          <p>Selecciona un rol y marca/desmarca los permisos que deseas asignar. Los cambios se guardarán cuando presiones "Guardar Cambios".</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector de Roles */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Seleccionar Rol</h3>
            <div className="space-y-2">
              {roles.map(role => (
                <motion.button
                  key={role.id_rol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedRole?.id_rol === role.id_rol
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold">{role.nombre}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {rolPermisos[role.id_rol]?.length || 0} permisos
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Permisos por Módulo */}
        <div className="lg:col-span-3">
          {!selectedRole ? (
            <div className="glass-effect rounded-xl p-12 text-center">
              <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Selecciona un rol para gestionar sus permisos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
                const Icon = moduleIcons[modulo] || Package;
                const totalPermisos = permisosModulo.length;
                const permisosActivos = permisosModulo.filter(p => 
                  hasPermission(selectedRole.id_rol, p.id_permiso)
                ).length;

                return (
                  <motion.div
                    key={modulo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    {/* Header del módulo */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white capitalize">
                            {modulo}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {permisosActivos} de {totalPermisos} permisos activos
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => selectAllModule(modulo)}
                          className="text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                          Seleccionar todos
                        </button>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={() => deselectAllModule(modulo)}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Deseleccionar todos
                        </button>
                      </div>
                    </div>

                    {/* Grid de permisos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permisosModulo.map(permiso => {
                        const isActive = hasPermission(selectedRole.id_rol, permiso.id_permiso);
                        const isPending = pendingChanges[selectedRole.id_rol]?.[permiso.id_permiso] !== undefined;

                        return (
                          <motion.div
                            key={permiso.id_permiso}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => togglePermission(permiso.id_permiso)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isActive
                                ? 'bg-green-500/10 border-green-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            } ${isPending ? 'ring-2 ring-yellow-500' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {isActive ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="font-semibold text-white text-sm">
                                    {permiso.nombre}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 ml-6">
                                  {permiso.descripcion}
                                </p>
                                <p className="text-xs text-gray-500 ml-6 mt-1 font-mono">
                                  {permiso.codigo}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsAdmin;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, AlertCircle, Loader2, Save, X, Info } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import PermissionGuard from '@/components/PermissionGuard';

/**
 * Componente para gestionar roles del sistema
 * Permite crear, editar y eliminar roles
 */
const RolesAdmin = () => {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Carga los roles desde la base de datos
   */
  const loadRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('id_rol', { ascending: true });

      if (error) throw error;

      setRoles(data || []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los roles',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /**
   * Abre el modal para crear un nuevo rol
   */
  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setShowModal(true);
  };

  /**
   * Abre el modal para editar un rol existente
   */
  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || '',
      activo: role.activo,
    });
    setShowModal(true);
  };

  /**
   * Guarda el rol (crear o actualizar)
   */
  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El nombre del rol es obligatorio',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingRole) {
        // Actualizar rol existente
        const { error } = await supabase
          .from('roles')
          .update({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            activo: formData.activo,
          })
          .eq('id_rol', editingRole.id_rol);

        if (error) throw error;

        toast({
          title: 'Rol actualizado',
          description: `El rol "${formData.nombre}" ha sido actualizado correctamente`,
        });
      } else {
        // Crear nuevo rol
        const { error } = await supabase
          .from('roles')
          .insert({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            activo: formData.activo,
            es_sistema: false, // Los roles creados manualmente no son del sistema
          });

        if (error) throw error;

        toast({
          title: 'Rol creado',
          description: `El rol "${formData.nombre}" ha sido creado correctamente`,
        });
      }

      setShowModal(false);
      loadRoles();
    } catch (error) {
      console.error('Error guardando rol:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo guardar el rol',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Elimina un rol
   */
  const handleDelete = async (role) => {
    // No permitir eliminar roles del sistema
    if (role.es_sistema) {
      toast({
        variant: 'destructive',
        title: 'No se puede eliminar',
        description: 'Los roles del sistema no pueden ser eliminados',
      });
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el rol "${role.nombre}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id_rol', role.id_rol);

      if (error) throw error;

      toast({
        title: 'Rol eliminado',
        description: `El rol "${role.nombre}" ha sido eliminado correctamente`,
      });

      loadRoles();
    } catch (error) {
      console.error('Error eliminando rol:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar el rol',
      });
    }
  };

  /**
   * Alterna el estado activo/inactivo de un rol
   */
  const toggleActive = async (role) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ activo: !role.activo })
        .eq('id_rol', role.id_rol);

      if (error) throw error;

      toast({
        title: role.activo ? 'Rol desactivado' : 'Rol activado',
        description: `El rol "${role.nombre}" ha sido ${role.activo ? 'desactivado' : 'activado'}`,
      });

      loadRoles();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar el estado del rol',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-red-500" />
            Gestión de Roles
          </h2>
          <p className="text-gray-600 mt-1">
            Administra los roles y permisos del sistema
          </p>
        </div>
        
        <PermissionGuard permission="roles.crear">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Rol</span>
          </motion.button>
        </PermissionGuard>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Información sobre roles</p>
          <p>Los roles del sistema (Administrador, Vendedor, Cliente) no pueden ser eliminados. Puedes crear roles personalizados y asignarles permisos específicos.</p>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {roles.map((role) => (
            <motion.div
              key={role.id_rol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass-effect rounded-xl p-6 border-2 ${
                role.activo ? 'border-red-500/30' : 'border-gray-500/30 opacity-60'
              }`}
            >
              {/* Badge del sistema */}
              {role.es_sistema && (
                <div className="inline-block bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full mb-3">
                  Rol del Sistema
                </div>
              )}

              {/* Nombre y descripción */}
              <h3 className="text-xl font-bold text-white mb-2">
                {role.nombre}
              </h3>
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                {role.descripcion || 'Sin descripción'}
              </p>

              {/* Estado */}
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    role.activo ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                <span className="text-sm text-gray-300">
                  {role.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2">
                <PermissionGuard permission="roles.editar">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(role)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </motion.button>
                </PermissionGuard>

                <PermissionGuard permission="roles.eliminar">
                  {!role.es_sistema && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(role)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </PermissionGuard>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleActive(role)}
                  className={`p-2 rounded-lg transition-colors ${
                    role.activo
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                  title={role.activo ? 'Desactivar' : 'Activar'}
                >
                  <Shield className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal para crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Ej: Gerente, Recepcionista"
                    disabled={submitting}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                    rows={3}
                    placeholder="Describe las responsabilidades de este rol"
                    disabled={submitting}
                  />
                </div>

                {/* Activo */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500"
                    disabled={submitting}
                  />
                  <label htmlFor="activo" className="text-sm text-gray-300">
                    Rol activo
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingRole ? 'Guardar' : 'Crear'}</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>Cancelar</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolesAdmin;

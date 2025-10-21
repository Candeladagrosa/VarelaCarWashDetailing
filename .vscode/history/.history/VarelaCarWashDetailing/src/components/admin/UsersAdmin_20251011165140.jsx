import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Plus, Save, X, Search, Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import PermissionGuard from '@/components/PermissionGuard';

/**
 * Componente para gestión de usuarios
 * Permite crear, editar, eliminar y cambiar estado de usuarios
 * Asigna roles dinámicamente desde la base de datos
 */
const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    id_rol: 3, // Cliente por defecto
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga usuarios y roles desde Supabase
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar roles activos
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('activo', true)
        .order('id');

      if (rolesError) {
        console.error('Error cargando roles:', rolesError);
        throw rolesError;
      }

      // Cargar usuarios (perfiles) con sus roles
      const { data: usersData, error: usersError } = await supabase
        .from('perfiles')
        .select(`
          *,
          roles:id_rol (
            id,
            nombre,
            descripcion
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error cargando usuarios:', usersError);
        throw usersError;
      }

      console.log('Roles cargados:', rolesData);
      console.log('Usuarios cargados:', usersData);

      setRoles(rolesData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudieron cargar los datos: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el formulario
   */
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      id_rol: 3, // Cliente por defecto
    });
    setShowForm(false);
    setEditingId(null);
  };

  /**
   * Guarda un usuario (crear o actualizar)
   */
  const handleSave = async () => {
    // Validaciones
    if (!formData.email || !formData.nombre || !formData.apellido || !formData.dni) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Completa todos los campos requeridos',
      });
      return;
    }

    if (!editingId && !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La contraseña es obligatoria para nuevos usuarios',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // Actualizar usuario existente
        const updateData = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          dni: parseInt(formData.dni),
          telefono: formData.telefono?.trim() || null,
          id_rol: formData.id_rol,
        };

        const { error } = await supabase
          .from('perfiles')
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Usuario actualizado',
          description: 'El usuario ha sido actualizado correctamente',
        });
      } else {
        // Crear nuevo usuario con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre.trim(),
              apellido: formData.apellido.trim(),
              dni: parseInt(formData.dni),
              telefono: formData.telefono?.trim() || null,
              id_rol: formData.id_rol,
            },
          },
        });

        if (authError) throw authError;

        // Actualizar el perfil con el rol seleccionado
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('perfiles')
            .update({ id_rol: formData.id_rol })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error actualizando rol:', profileError);
          }
        }

        toast({
          title: 'Usuario creado',
          description: 'El nuevo usuario ha sido creado correctamente',
        });
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo guardar el usuario',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Abre el formulario para editar un usuario
   */
  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '',
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni?.toString() || '',
      telefono: user.telefono || '',
      id_rol: user.id_rol || 3,
    });
    setShowForm(true);
  };

  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  const toggleStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Usuario desactivado' : 'Usuario activado',
        description: 'Se actualizó el estado del usuario',
      });

      loadData();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar el estado del usuario',
      });
    }
  };

  /**
   * Elimina un usuario
   */
  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Nota: En Supabase Auth, normalmente no se eliminan usuarios directamente desde el cliente
      // Se puede desactivar el perfil en su lugar
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuario desactivado',
        description: 'El usuario ha sido desactivado correctamente',
      });

      loadData();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
      });
    }
  };

  /**
   * Filtra usuarios según término de búsqueda
   */
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      (user.nombre?.toLowerCase() || '').includes(search) ||
      (user.apellido?.toLowerCase() || '').includes(search) ||
      (user.email?.toLowerCase() || '').includes(search) ||
      (user.dni?.toString() || '').includes(search) ||
      (user.roles?.nombre?.toLowerCase() || '').includes(search)
    );
  });

  /**
   * Obtiene el icono según el rol
   */
  const getRoleIcon = (idRol) => {
    if (idRol === 1) return <Shield className="w-6 h-6 text-white" />;
    return <User className="w-6 h-6 text-gray-600" />;
  };

  /**
   * Obtiene el color del badge según el rol
   */
  const getRoleColor = (idRol) => {
    if (idRol === 1) return 'bg-gradient-to-br from-red-700 to-red-500';
    if (idRol === 2) return 'bg-gradient-to-br from-blue-600 to-blue-500';
    return 'bg-gray-200';
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Gestión de Usuarios</h2>
          <PermissionGuard permission="usuarios.crear">
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            )}
          </PermissionGuard>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre, apellido, email o DNI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" />
        </div>
      </motion.div>

      <PermissionGuard permissions={['usuarios.crear', 'usuarios.editar']}>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Nombre" 
                value={formData.nombre} 
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <input 
                type="text" 
                placeholder="Apellido" 
                value={formData.apellido} 
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <input 
                type="password" 
                placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'} 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <input 
                type="number" 
                placeholder="DNI" 
                value={formData.dni} 
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <input 
                type="tel" 
                placeholder="Teléfono (opcional)" 
                value={formData.telefono} 
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" 
              />
              <select 
                value={formData.id_rol} 
                onChange={(e) => setFormData({ ...formData, id_rol: parseInt(e.target.value) })} 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Seleccionar Rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 mt-4">
              <Button 
                onClick={handleSave} 
                disabled={submitting}
                className="bg-gradient-to-r from-red-700 to-red-500"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </PermissionGuard>

      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div 
            key={user.id} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: index * 0.05 }} 
            className={`glass-effect rounded-2xl p-6 ${!user.activo ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRoleColor(user.id_rol)}`}>
                  {getRoleIcon(user.id_rol)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.nombre} {user.apellido}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">DNI: {user.dni}</p>
                    {user.roles && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.roles.nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </div>
                <PermissionGuard permission="usuarios.editar">
                  <Button 
                    onClick={() => toggleStatus(user.id, user.activo)} 
                    variant="outline" 
                    size="sm"
                  >
                    {user.activo ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleEdit(user)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="usuarios.eliminar">
                  <Button 
                    onClick={() => handleDelete(user.id)} 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UsersAdmin;
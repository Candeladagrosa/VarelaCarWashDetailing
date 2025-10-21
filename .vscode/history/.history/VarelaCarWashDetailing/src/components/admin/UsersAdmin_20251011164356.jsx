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
        .order('id_rol');

      if (rolesError) throw rolesError;

      // Cargar usuarios (perfiles) con sus roles
      const { data: usersData, error: usersError } = await supabase
        .from('perfiles')
        .select(`
          *,
          roles (
            id_rol,
            nombre,
            descripcion
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setRoles(rolesData || []);
      setUsers(usersData || []);
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

  const resetForm = () => {
    setFormData({ email: '', password: '', nombre: '', apellido: '', dni: '', telefono: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.email || !formData.nombre || !formData.apellido || !formData.dni || (!editingId && !formData.password)) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'destructive' });
      return;
    }

    if (editingId) {
      // Update
      const updatedUsers = users.map(u => u.id_usuario === editingId ? { ...u, ...formData, dni: parseInt(formData.dni), password: formData.password || u.password } : u);
      saveUsers(updatedUsers);
      toast({ title: '¡Actualizado! ✅', description: 'El usuario ha sido actualizado.' });
    } else {
      // Add
      if (users.find(u => u.email === formData.email)) {
        toast({ title: 'Error', description: 'Este email ya está registrado', variant: 'destructive' });
        return;
      }
      const newAdmin = {
        id_usuario: users.length > 0 ? Math.max(...users.map(u => u.id_usuario)) + 1 : 1,
        id_rol: 1,
        ...formData,
        dni: parseInt(formData.dni),
        estado: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveUsers([...users, newAdmin]);
      toast({ title: '¡Administrador Agregado! ✅', description: 'El nuevo usuario administrador ha sido creado.' });
    }
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingId(user.id_usuario);
    setFormData({
      email: user.email,
      password: '', // Don't show password
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni.toString(),
      telefono: user.telefono || '',
    });
    setShowForm(true);
  };

  const toggleStatus = (id) => {
    const updatedUsers = users.map(u => u.id_usuario === id ? { ...u, estado: u.estado === 1 ? 0 : 1 } : u);
    saveUsers(updatedUsers);
    toast({ title: 'Estado Cambiado', description: 'Se actualizó el estado del usuario.' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      const updatedUsers = users.filter(u => u.id_usuario !== id);
      saveUsers(updatedUsers);
      toast({ title: 'Usuario Eliminado', description: 'El usuario ha sido eliminado permanentemente.' });
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      (user.nombre?.toLowerCase() || '').includes(search) ||
      (user.apellido?.toLowerCase() || '').includes(search) ||
      (user.email?.toLowerCase() || '').includes(search) ||
      (user.dni?.toString() || '').includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Gestión de Usuarios</h2>
          <PermissionGuard permission="usuarios.crear">
            {!showForm && <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Nuevo Admin</Button>}
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
              <input type="text" placeholder="Apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
              <input type="password" placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
              <input type="number" placeholder="DNI" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
              <input type="tel" placeholder="Teléfono (opcional)" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
            </div>
            <div className="flex space-x-3 mt-4">
              <Button onClick={handleSave} className="bg-gradient-to-r from-red-700 to-red-500"><Save className="w-4 h-4 mr-2" />Guardar</Button>
              <Button onClick={resetForm} variant="outline"><X className="w-4 h-4 mr-2" />Cancelar</Button>
            </div>
          </motion.div>
        )}
      </PermissionGuard>

      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div key={user.id_usuario} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`glass-effect rounded-2xl p-6 ${user.estado === 0 ? 'opacity-60' : ''}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user.id_rol === 1 ? 'bg-gradient-to-br from-red-700 to-red-500' : 'bg-gray-200'}`}>
                  {user.id_rol === 1 ? <Shield className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-gray-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.nombre} {user.apellido}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">DNI: {user.dni}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${user.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{user.estado === 1 ? 'Activo' : 'Inactivo'}</div>
                <PermissionGuard permission="usuarios.editar">
                  <Button onClick={() => toggleStatus(user.id_usuario)} variant="outline" size="sm">{user.estado === 1 ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-600" />}</Button>
                  <Button onClick={() => handleEdit(user)} variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                </PermissionGuard>
                <PermissionGuard permission="usuarios.eliminar">
                  {user.id_usuario !== 1 && <Button onClick={() => handleDelete(user.id_usuario)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>}
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
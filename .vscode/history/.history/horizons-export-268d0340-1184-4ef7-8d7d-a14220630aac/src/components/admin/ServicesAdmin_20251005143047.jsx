import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ServicesAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('estado', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los servicios',
        variant: 'destructive'
      });
      console.error('Error cargando servicios:', error);
      setLoading(false);
      return;
    }

    setServices(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.nombre || !formData.precio) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        imagen_url: formData.imagen,
        estado: true
      }])
      .select();

    if (error) {
      console.error('Error agregando servicio:', error);
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' });
    await loadServices();
    toast({ title: '¡Servicio Agregado! ✅', description: 'El servicio ha sido creado exitosamente' });
  };

  const handleEdit = (service) => {
    setEditingId(service.id_servicio);
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: service.precio.toString(),
      imagen: service.imagen_url || '',
    });
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('servicios')
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        imagen_url: formData.imagen,
        updated_at: new Date().toISOString()
      })
      .eq('id_servicio', editingId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' });
    loadServices();
    toast({ title: '¡Actualizado! ✅', description: 'El servicio ha sido actualizado' });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('servicios')
      .update({ estado: false })
      .eq('id_servicio', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    loadServices();
    toast({ title: 'Servicio Eliminado', description: 'El servicio ha sido desactivado' });
  };

  const toggleVisibility = async (id) => {
    const service = services.find(s => s.id_servicio === id);
    const { error } = await supabase
      .from('servicios')
      .update({ visible: !service.visible })
      .eq('id_servicio', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    loadServices();
    toast({ title: 'Visibilidad Cambiada', description: 'Se actualizó la visibilidad del servicio' });
  };

  const filteredServices = services.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold gradient-text mb-4">
          {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          <input type="number" placeholder="Precio" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          <div className="md:col-span-2">
            <input type="text" placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="URL de la imagen" value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {editingId ? (
            <>
              <Button onClick={handleUpdate} className="bg-gradient-to-r from-red-700 to-red-500"><Save className="w-4 h-4 mr-2" />Guardar</Button>
              <Button onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' }); }} variant="outline"><X className="w-4 h-4 mr-2" />Cancelar</Button>
            </>
          ) : (
            <Button onClick={handleAdd} className="bg-gradient-to-r from-red-700 to-red-500"><Plus className="w-4 h-4 mr-2" />Agregar Servicio</Button>
          )}
        </div>
      </motion.div>

      <div className="relative glass-effect rounded-2xl p-6">
        <Search className="absolute left-9 top-12 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar servicios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
        <div className="space-y-4">
          {filteredServices.map((service, index) => (
            <motion.div key={service.id_servicio} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/50 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={service.imagen_url || 'https://via.placeholder.com/100'} alt={service.nombre} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{service.nombre}</h3>
                  <span className="text-lg font-bold gradient-text mt-1 inline-block">${service.precio.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => toggleVisibility(service.id_servicio)} variant="outline" size="sm">{service.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                <Button onClick={() => handleEdit(service)} variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDelete(service.id_servicio)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesAdmin;
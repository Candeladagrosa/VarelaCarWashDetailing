import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ServicesAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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

  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `servicios/${fileName}`;

      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        toast({
          title: 'Error',
          description: 'No se pudo subir la imagen',
          variant: 'destructive'
        });
        setUploading(false);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);

      setUploading(false);
      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      setUploading(false);
      return null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Por favor selecciona un archivo de imagen válido',
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'La imagen no debe superar los 5MB',
          variant: 'destructive'
        });
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.nombre || !formData.precio) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'destructive' });
      return;
    }

    setLoading(true);

    let imageUrl = formData.imagen;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        imagen_url: imageUrl,
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
    setImageFile(null);
    setImagePreview('');
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
    setImagePreview(service.imagen_url || '');
    setImageFile(null);
  };

  const handleUpdate = async () => {
    setLoading(true);

    let imageUrl = formData.imagen;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from('servicios')
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        imagen_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id_servicio', editingId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    loadServices();
    toast({ title: '¡Actualizado! ✅', description: 'El servicio ha sido actualizado' });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id_servicio', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    loadServices();
    toast({ title: 'Servicio Eliminado', description: 'El servicio ha sido eliminado' });
  };

  const toggleVisibility = async (id) => {
    const service = services.find(s => s.id_servicio === id);
    const { error } = await supabase
      .from('servicios')
      .update({ estado: !service.estado })
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
            <label className="block text-sm font-medium mb-2">Imagen del Servicio</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>
              {uploading && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
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
                <Button onClick={() => toggleVisibility(service.id_servicio)} variant="outline" size="sm">{service.estado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
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
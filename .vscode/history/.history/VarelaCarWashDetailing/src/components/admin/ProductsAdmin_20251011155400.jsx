import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import PermissionGuard from '@/components/PermissionGuard';

const ProductsAdmin = () => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_actual: '',
    stock: '',
    imagen: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true); // Agregar estado de loading

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive'
      });
      console.error('Error cargando productos:', error);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    
    try {
      // Generar nombre único para la imagen
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      // Subir imagen a Supabase Storage
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

      // Obtener URL pública de la imagen
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
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Por favor selecciona un archivo de imagen válido',
          variant: 'destructive'
        });
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'La imagen no debe superar los 5MB',
          variant: 'destructive'
        });
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const saveProducts = (updatedProducts) => {
  //   localStorage.setItem('products', JSON.stringify(updatedProducts));
  //   setProducts(updatedProducts);
  // };

  const handleAdd = async () => {
    if (!formData.nombre || !formData.precio_actual || !formData.stock) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'destructive' });
      return;
    }

    setLoading(true);

    // Subir imagen si hay una seleccionada
    let imageUrl = formData.imagen;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_actual: parseFloat(formData.precio_actual),
        stock: parseInt(formData.stock),
        imagen_url: imageUrl,
        estado: true
      }])
      .select();

    if (error) {
      console.error('Error agregando producto:', error);
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    await loadProducts();
    toast({ title: '¡Producto Agregado! ✅', description: 'El producto ha sido creado exitosamente' });
  };

  const handleEdit = (product) => {
    setEditingId(product.id_producto);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio_actual: product.precio_actual.toString(),
      stock: product.stock.toString(),
      imagen: product.imagen_url || '',
    });
    setImagePreview(product.imagen_url || '');
    setImageFile(null);
  };

  const handleUpdate = async () => {
    setLoading(true);

    // Subir nueva imagen si se seleccionó una
    let imageUrl = formData.imagen;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from('productos')
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_actual: parseFloat(formData.precio_actual),
        stock: parseInt(formData.stock),
        imagen_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id_producto', editingId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    loadProducts(); // Recargar la lista
    toast({ title: '¡Actualizado! ✅', description: 'El producto ha sido actualizado' });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('productos')
      .update({ estado: false })
      .eq('id_producto', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    loadProducts(); // Recargar la lista
    toast({ title: 'Producto Eliminado', description: 'El producto ha sido desactivado' });
  };

  const toggleVisibility = async (id) => {
    const product = products.find(p => p.id_producto === id);
    const { error } = await supabase
      .from('productos')
      .update({ visible: !product.visible })
      .eq('id_producto', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    loadProducts();
    toast({ title: 'Visibilidad Cambiada', description: 'Se actualizó la visibilidad del producto' });
  };

  const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

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
          {editingId ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          <input type="text" placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          <input type="number" placeholder="Precio" value={formData.precio_actual} onChange={(e) => setFormData({ ...formData, precio_actual: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
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
              <Button onClick={handleUpdate} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' }); setImageFile(null); setImagePreview(''); }} variant="outline"><X className="w-4 h-4 mr-2" />Cancelar</Button>
            </>
          ) : (
            <Button onClick={handleAdd} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          )}
        </div>
      </motion.div>

      <div className="relative glass-effect rounded-2xl p-6">
        <Search className="absolute left-9 top-12 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" />
        <div className="space-y-4">
          {filteredProducts.map((product, index) => (
            <motion.div key={product.id_producto} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/50 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={product.imagen_url || 'https://via.placeholder.com/100'} alt={product.nombre} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{product.nombre}</h3>
                  <div className="flex space-x-4 mt-1">
                    <span className="text-lg font-bold gradient-text">${product.precio_actual.toLocaleString()}</span>
                    <span className="text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => toggleVisibility(product.id_producto)} variant="outline" size="sm">{product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                <Button onClick={() => handleEdit(product)} variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDelete(product.id_producto)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
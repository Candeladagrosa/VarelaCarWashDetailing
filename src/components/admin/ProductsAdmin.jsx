import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import PermissionGuard from '@/components/PermissionGuard';
import { useTranslation } from 'react-i18next';
import { getSupabaseErrorMessage } from '@/lib/errorTranslations';

const ProductsAdmin = () => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const { t } = useTranslation();
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
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', true)
      .order('created_at', { ascending: false });

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: t('products.messages.loadErrorDescription'),
        variant: 'destructive'
      });
      console.error('Error cargando productos:', error);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  /**
   * Sube una imagen a Supabase Storage
   * @param {File} file - Archivo de imagen a subir
   * @returns {Promise<string|null>} URL pública de la imagen o null si hay error
   */
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
        const errorMsg = getSupabaseErrorMessage(error);
        toast({
          title: t('products.messages.uploadError'),
          description: errorMsg.description,
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
      toast({
        title: t('products.messages.uploadError'),
        description: t('products.messages.uploadErrorDescription'),
        variant: 'destructive'
      });
      setUploading(false);
      return null;
    }
  };

  /**
   * Maneja el cambio de archivo de imagen
   * @param {Event} e - Evento del input file
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('errors.titles.validationError'),
          description: t('products.validation.imageFormat'),
          variant: 'destructive'
        });
        e.target.value = null;
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('errors.titles.validationError'),
          description: t('products.validation.imageSize'),
          variant: 'destructive'
        });
        e.target.value = null;
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

  /**
   * Convierte el precio en formato español (1500,50) a formato decimal (1500.50)
   * @param {string} priceString - Precio en formato español
   * @returns {number|null} Precio como número decimal o null si es inválido
   */
  const parseSpanishPrice = (priceString) => {
    if (!priceString || priceString.trim() === '') return null;
    
    // Eliminar espacios y reemplazar coma por punto
    const _cleanPrice = priceString.trim().replace(',', '.');
    
    // Validar que sea un número válido
    const _price = parseFloat(_cleanPrice);
    return isNaN(_price) ? null : _price;
  };

  /**
   * Valida que el precio cumpla con las restricciones de PostgreSQL NUMERIC
   * @param {number} price - Precio a validar
   * @returns {Object} { isValid: boolean, error: string|null }
   */
  const validatePrice = (price) => {
    // Validar que el precio sea mayor a 0
    if (price <= 0) {
      return { isValid: false, error: t('products.validation.pricePositive') };
    }

    // Validar límite superior (PostgreSQL NUMERIC puede manejar hasta 131072 dígitos antes del punto decimal,
    // pero establecemos un límite razonable de 999,999,999.99)
    if (price > 999999999.99) {
      return { isValid: false, error: t('products.validation.priceTooLarge') };
    }

    // Validar cantidad de decimales (máximo 2)
    const _priceStr = price.toString();
    const _decimalPart = _priceStr.split('.')[1];
    if (_decimalPart && _decimalPart.length > 2) {
      return { isValid: false, error: t('products.validation.priceDecimalPlaces') };
    }

    return { isValid: true, error: null };
  };

  /**
   * Valida que el stock cumpla con las restricciones de PostgreSQL INT4
   * @param {number} stock - Stock a validar
   * @returns {Object} { isValid: boolean, error: string|null }
   */
  const validateStock = (stock) => {
    // Validar que sea un número entero
    if (!Number.isInteger(stock)) {
      return { isValid: false, error: t('products.validation.stockInvalid') };
    }

    // Validar que no sea negativo
    if (stock < 0) {
      return { isValid: false, error: t('products.validation.stockNonNegative') };
    }

    // Validar límite superior de INT4 en PostgreSQL (2,147,483,647)
    if (stock > 2147483647) {
      return { isValid: false, error: t('products.validation.stockTooLarge') };
    }

    return { isValid: true, error: null };
  };

  /**
   * Convierte un precio decimal a formato español para mostrar
   * @param {number} price - Precio como número
   * @returns {string} Precio en formato español (1500,50)
   */
  const formatSpanishPrice = (price) => {
    if (!price && price !== 0) return '';
    return price.toString().replace('.', ',');
  };

  /**
   * Valida los campos del formulario
   * @returns {boolean} true si todos los campos son válidos
   */
  const validateForm = () => {
    const _errors = {};
    
    // Validar nombre
    if (!formData.nombre || formData.nombre.trim() === '') {
      _errors.nombre = t('products.validation.nameRequired');
    } else if (formData.nombre.length > 100) {
      _errors.nombre = t('products.validation.nameMaxLength');
    }
    
    // Validar descripción
    if (formData.descripcion && formData.descripcion.length > 255) {
      _errors.descripcion = t('products.validation.descriptionMaxLength');
    }
    
    // Validar precio
    if (!formData.precio_actual || formData.precio_actual.trim() === '') {
      _errors.precio_actual = t('products.validation.priceRequired');
    } else {
      const _price = parseSpanishPrice(formData.precio_actual);
      if (_price === null) {
        _errors.precio_actual = t('products.validation.priceInvalid');
      } else {
        const _priceValidation = validatePrice(_price);
        if (!_priceValidation.isValid) {
          _errors.precio_actual = _priceValidation.error;
        }
      }
    }
    
    // Validar stock
    if (!formData.stock || formData.stock.trim() === '') {
      _errors.stock = t('products.validation.stockRequired');
    } else {
      const _stock = parseInt(formData.stock);
      if (isNaN(_stock)) {
        _errors.stock = t('products.validation.stockInvalid');
      } else {
        const _stockValidation = validateStock(_stock);
        if (!_stockValidation.isValid) {
          _errors.stock = _stockValidation.error;
        }
      }
    }
    
    setValidationErrors(_errors);
    return Object.keys(_errors).length === 0;
  };

  const handleAdd = async () => {
    // Validar formulario
    if (!validateForm()) {
      toast({ 
        title: t('errors.titles.validationError'), 
        description: t('products.validation.completeRequired'), 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    // Subir imagen si hay una seleccionada
    let _imageUrl = formData.imagen;
    if (imageFile) {
      _imageUrl = await uploadImage(imageFile);
      if (!_imageUrl) {
        setLoading(false);
        return;
      }
    }

    // Parsear precio y stock
    const _price = parseSpanishPrice(formData.precio_actual);
    const _stock = parseInt(formData.stock);

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_actual: _price,
        stock: _stock,
        imagen_url: _imageUrl,
        estado: true,
        visible: true
      }])
      .select();

    if (error) {
      console.error('Error agregando producto:', error);
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    setValidationErrors({});
    await loadProducts();
    toast({ 
      title: t('products.messages.added'), 
      description: t('products.messages.addedDescription') 
    });
  };

  /**
   * Prepara el formulario para editar un producto
   * @param {Object} product - Producto a editar
   */
  const handleEdit = (product) => {
    setEditingId(product.id_producto);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio_actual: formatSpanishPrice(product.precio_actual),
      stock: product.stock.toString(),
      imagen: product.imagen_url || '',
    });
    setImagePreview(product.imagen_url || '');
    setImageFile(null);
    setValidationErrors({});
  };

  const handleUpdate = async () => {
    // Validar formulario
    if (!validateForm()) {
      toast({ 
        title: t('errors.titles.validationError'), 
        description: t('products.validation.completeRequired'), 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    // Subir nueva imagen si se seleccionó una
    let _imageUrl = formData.imagen;
    if (imageFile) {
      _imageUrl = await uploadImage(imageFile);
      if (!_imageUrl) {
        setLoading(false);
        return;
      }
    }

    // Parsear precio y stock
    const _price = parseSpanishPrice(formData.precio_actual);
    const _stock = parseInt(formData.stock);

    const { error } = await supabase
      .from('productos')
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_actual: _price,
        stock: _stock,
        imagen_url: _imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id_producto', editingId);

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    setValidationErrors({});
    await loadProducts();
    toast({ 
      title: t('products.messages.updated'), 
      description: t('products.messages.updatedDescription') 
    });
  };

  /**
   * Elimina (desactiva) un producto
   * @param {number} id - ID del producto a eliminar
   */
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('productos')
      .update({ estado: false })
      .eq('id_producto', id);

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      return;
    }

    await loadProducts();
    toast({ 
      title: t('products.messages.deleted'), 
      description: t('products.messages.deletedDescription') 
    });
  };

  /**
   * Cambia la visibilidad de un producto
   * @param {number} id - ID del producto
   */
  const toggleVisibility = async (id) => {
    const _product = products.find(p => p.id_producto === id);
    if (!_product) return;

    const { error } = await supabase
      .from('productos')
      .update({ visible: !_product.visible })
      .eq('id_producto', id);

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      return;
    }

    await loadProducts();
    toast({ 
      title: t('products.messages.visibilityChanged'), 
      description: t('products.messages.visibilityChangedDescription') 
    });
  };

  const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PermissionGuard permissions={['productos.crear', 'productos.editar']}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold gradient-text mb-6">
            {editingId ? t('products.editProduct') : t('products.newProduct')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('products.fields.name')} <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                placeholder={t('products.placeholders.name')} 
                value={formData.nombre}
                maxLength={100}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
                  if (validationErrors.nombre) {
                    setValidationErrors({ ...validationErrors, nombre: undefined });
                  }
                }} 
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.nombre ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-600`} 
              />
              {validationErrors.nombre ? (
                <p className="text-red-600 text-sm mt-1">{validationErrors.nombre}</p>
              ) : (
                <p className="text-gray-500 text-xs mt-1">{formData.nombre.length}/100 caracteres</p>
              )}
            </div>

            {/* Campo Descripción */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('products.fields.description')}
              </label>
              <input 
                type="text" 
                placeholder={t('products.placeholders.description')} 
                value={formData.descripcion}
                maxLength={255}
                onChange={(e) => {
                  setFormData({ ...formData, descripcion: e.target.value });
                  if (validationErrors.descripcion) {
                    setValidationErrors({ ...validationErrors, descripcion: undefined });
                  }
                }} 
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.descripcion ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-600`} 
              />
              {validationErrors.descripcion ? (
                <p className="text-red-600 text-sm mt-1">{validationErrors.descripcion}</p>
              ) : (
                <p className="text-gray-500 text-xs mt-1">{formData.descripcion.length}/255 caracteres</p>
              )}
            </div>

            {/* Campo Precio */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('products.fields.price')} <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                placeholder={t('products.placeholders.price')}
                maxLength={13}
                value={formData.precio_actual} 
                onChange={(e) => {
                  // Permitir solo números, coma y punto
                  const _value = e.target.value.replace(/[^0-9,]/g, '');
                  setFormData({ ...formData, precio_actual: _value });
                  if (validationErrors.precio_actual) {
                    setValidationErrors({ ...validationErrors, precio_actual: undefined });
                  }
                }} 
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.precio_actual ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-600`} 
              />
              {validationErrors.precio_actual ? (
                <p className="text-red-600 text-sm mt-1">{validationErrors.precio_actual}</p>
              ) : (
                <p className="text-gray-500 text-xs mt-1">{t('products.hints.price')}</p>
              )}
            </div>

            {/* Campo Stock */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('products.fields.stock')} <span className="text-red-600">*</span>
              </label>
              <input 
                type="number"
                min="0"
                max="2147483647"
                placeholder={t('products.placeholders.stock')} 
                value={formData.stock} 
                onChange={(e) => {
                  setFormData({ ...formData, stock: e.target.value });
                  if (validationErrors.stock) {
                    setValidationErrors({ ...validationErrors, stock: undefined });
                  }
                }} 
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.stock ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-600`} 
              />
              {validationErrors.stock ? (
                <p className="text-red-600 text-sm mt-1">{validationErrors.stock}</p>
              ) : (
                <p className="text-gray-500 text-xs mt-1">{t('products.hints.stock')}</p>
              )}
            </div>
            
            {/* Campo Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('products.fields.image')}
              </label>
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
              <p className="text-gray-500 text-xs mt-1">{t('products.hints.image')}</p>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">{t('products.fields.imagePreview')}</p>
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
                <PermissionGuard permission="productos.editar">
                  <Button onClick={handleUpdate} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {loading ? t('products.messages.saving') : t('common.save')}
                  </Button>
                </PermissionGuard>
                <Button onClick={() => { 
                  setEditingId(null); 
                  setFormData({ nombre: '', descripcion: '', precio_actual: '', stock: '', imagen: '' }); 
                  setImageFile(null); 
                  setImagePreview(''); 
                  setValidationErrors({});
                }} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <PermissionGuard permission="productos.crear">
                <Button onClick={handleAdd} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {loading ? t('products.messages.adding') : t('products.addProduct')}
                </Button>
              </PermissionGuard>
            )}
          </div>
        </motion.div>
      </PermissionGuard>

      <div className="relative glass-effect rounded-2xl p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('products.searchProducts')} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" 
          />
        </div>
        <div className="space-y-4">
          {filteredProducts.map((product, index) => (
            <motion.div 
              key={product.id_producto} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="bg-white/50 rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={product.imagen_url || 'https://via.placeholder.com/100'} 
                  alt={product.nombre} 
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-800">{product.nombre}</h3>
                    {product.visible ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {t('products.visible')}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {t('products.hidden')}
                      </span>
                    )}
                  </div>
                  {product.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{product.descripcion}</p>
                  )}
                  <div className="flex space-x-4 mt-1">
                    <span className="text-lg font-bold gradient-text">
                      ${formatSpanishPrice(product.precio_actual)}
                    </span>
                    <span className="text-gray-500">
                      {t('products.stock')} {product.stock}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <PermissionGuard permission="productos.cambiar_estado">
                  <Button 
                    onClick={() => toggleVisibility(product.id_producto)} 
                    variant="outline" 
                    size="sm"
                    title={product.visible ? 'Ocultar producto' : 'Mostrar producto'}
                  >
                    {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="productos.editar">
                  <Button 
                    onClick={() => handleEdit(product)} 
                    variant="outline" 
                    size="sm"
                    title="Editar producto"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="productos.eliminar">
                  <Button 
                    onClick={() => handleDelete(product.id_producto)} 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </PermissionGuard>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
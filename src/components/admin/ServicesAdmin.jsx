import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Search, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import PermissionGuard from '@/components/PermissionGuard';
import { useTranslation } from 'react-i18next';
import { getSupabaseErrorMessage } from '@/lib/errorTranslations';

const ServicesAdmin = () => {
  const { t } = useTranslation();
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
  const [validationErrors, setValidationErrors] = useState({});

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
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: t('services.messages.loadErrorDescription'),
        variant: 'destructive'
      });
      console.error('Error cargando servicios:', error);
      setLoading(false);
      return;
    }

    setServices(data || []);
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
      const _fileExt = file.name.split('.').pop();
      const _fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${_fileExt}`;
      const _filePath = `servicios/${_fileName}`;

      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(_filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        const errorMsg = getSupabaseErrorMessage(error);
        toast({
          title: t('services.messages.uploadError'),
          description: errorMsg.description,
          variant: 'destructive'
        });
        setUploading(false);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes')
        .getPublicUrl(_filePath);

      setUploading(false);
      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      toast({
        title: t('services.messages.uploadError'),
        description: t('services.messages.uploadErrorDescription'),
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
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('errors.titles.validationError'),
          description: t('services.validation.imageFormat'),
          variant: 'destructive'
        });
        e.target.value = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('errors.titles.validationError'),
          description: t('services.validation.imageSize'),
          variant: 'destructive'
        });
        e.target.value = null;
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

  /**
   * Convierte el precio en formato español (1500,50) a formato decimal (1500.50)
   * @param {string} priceString - Precio en formato español
   * @returns {number|null} Precio como número decimal o null si es inválido
   */
  const parseSpanishPrice = (priceString) => {
    if (!priceString || priceString.trim() === '') return null;
    
    const _cleanPrice = priceString.trim().replace(',', '.');
    const _price = parseFloat(_cleanPrice);
    return isNaN(_price) ? null : _price;
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
   * Valida que el precio cumpla con las restricciones de PostgreSQL NUMERIC
   * @param {number} price - Precio a validar
   * @returns {Object} { isValid: boolean, error: string|null }
   */
  const validatePrice = (price) => {
    if (price <= 0) {
      return { isValid: false, error: t('services.validation.pricePositive') };
    }

    if (price > 999999999.99) {
      return { isValid: false, error: t('services.validation.priceTooLarge') };
    }

    const _priceStr = price.toString();
    const _decimalPart = _priceStr.split('.')[1];
    if (_decimalPart && _decimalPart.length > 2) {
      return { isValid: false, error: t('services.validation.priceDecimalPlaces') };
    }

    return { isValid: true, error: null };
  };

  /**
   * Valida los campos del formulario
   * @returns {boolean} true si todos los campos son válidos
   */
  const validateForm = () => {
    const _errors = {};
    
    // Validar nombre
    if (!formData.nombre || formData.nombre.trim() === '') {
      _errors.nombre = t('services.validation.nameRequired');
    } else if (formData.nombre.length > 100) {
      _errors.nombre = t('services.validation.nameMaxLength');
    }
    
    // Validar descripción
    if (formData.descripcion && formData.descripcion.length > 255) {
      _errors.descripcion = t('services.validation.descriptionMaxLength');
    }
    
    // Validar precio
    if (!formData.precio || formData.precio.trim() === '') {
      _errors.precio = t('services.validation.priceRequired');
    } else {
      const _price = parseSpanishPrice(formData.precio);
      if (_price === null) {
        _errors.precio = t('services.validation.priceInvalid');
      } else {
        const _priceValidation = validatePrice(_price);
        if (!_priceValidation.isValid) {
          _errors.precio = _priceValidation.error;
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
        description: t('services.validation.completeRequired'), 
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

    // Parsear precio
    const _price = parseSpanishPrice(formData.precio);

    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: _price,
        imagen_url: _imageUrl,
        estado: true
      }])
      .select();

    if (error) {
      console.error('Error agregando servicio:', error);
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    setValidationErrors({});
    await loadServices();
    toast({ 
      title: t('services.messages.added'), 
      description: t('services.messages.addedDescription') 
    });
  };

  /**
   * Prepara el formulario para editar un servicio
   * @param {Object} service - Servicio a editar
   */
  const handleEdit = (service) => {
    setEditingId(service.id_servicio);
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio: formatSpanishPrice(service.precio),
      imagen: service.imagen_url || '',
    });
    setImagePreview(service.imagen_url || '');
    setImageFile(null);
    setValidationErrors({});
  };

  const handleUpdate = async () => {
    // Validar formulario
    if (!validateForm()) {
      toast({ 
        title: t('errors.titles.validationError'), 
        description: t('services.validation.completeRequired'), 
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

    // Parsear precio
    const _price = parseSpanishPrice(formData.precio);

    const { error } = await supabase
      .from('servicios')
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: _price,
        imagen_url: _imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id_servicio', editingId);

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
    setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' });
    setImageFile(null);
    setImagePreview('');
    setValidationErrors({});
    await loadServices();
    toast({ 
      title: t('services.messages.updated'), 
      description: t('services.messages.updatedDescription') 
    });
  };

  /**
   * Elimina un servicio
   * @param {number} id - ID del servicio a eliminar
   */
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id_servicio', id);

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      return;
    }

    await loadServices();
    toast({ 
      title: t('services.messages.deleted'), 
      description: t('services.messages.deletedDescription') 
    });
  };

  /**
   * Cambia la visibilidad de un servicio
   * @param {number} id - ID del servicio
   */
  const toggleVisibility = async (id) => {
    const _service = services.find(s => s.id_servicio === id);
    if (!_service) return;

    const { error } = await supabase
      .from('servicios')
      .update({ estado: !_service.estado })
      .eq('id_servicio', id);

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({ 
        title: errorMsg.title, 
        description: errorMsg.description, 
        variant: 'destructive' 
      });
      return;
    }

    await loadServices();
    toast({ 
      title: t('services.messages.visibilityChanged'), 
      description: t('services.messages.visibilityChangedDescription') 
    });
  };

  const filteredServices = services.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PermissionGuard permissions={['servicios.crear', 'servicios.editar']}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold gradient-text mb-6">
            {editingId ? t('services.editService') : t('services.newService')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('services.fields.name')} <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                placeholder={t('services.placeholders.name')} 
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

            {/* Campo Precio */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('services.fields.price')} <span className="text-red-600">*</span>
              </label>
              <input 
                type="text" 
                placeholder={t('services.placeholders.price')}
                maxLength={13}
                value={formData.precio} 
                onChange={(e) => {
                  // Permitir solo números y coma
                  const _value = e.target.value.replace(/[^0-9,]/g, '');
                  setFormData({ ...formData, precio: _value });
                  if (validationErrors.precio) {
                    setValidationErrors({ ...validationErrors, precio: undefined });
                  }
                }} 
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.precio ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-600`} 
              />
              {validationErrors.precio ? (
                <p className="text-red-600 text-sm mt-1">{validationErrors.precio}</p>
              ) : (
                <p className="text-gray-500 text-xs mt-1">{t('services.hints.price')}</p>
              )}
            </div>

            {/* Campo Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('services.fields.description')}
              </label>
              <input 
                type="text" 
                placeholder={t('services.placeholders.description')} 
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
            
            {/* Campo Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('services.fields.image')}
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
              <p className="text-gray-500 text-xs mt-1">{t('services.hints.image')}</p>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">{t('services.fields.imagePreview')}</p>
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
                <PermissionGuard permission="servicios.editar">
                  <Button onClick={handleUpdate} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {loading ? t('services.messages.saving') : t('common.save')}
                  </Button>
                </PermissionGuard>
                <Button onClick={() => { 
                  setEditingId(null); 
                  setFormData({ nombre: '', descripcion: '', precio: '', imagen: '' }); 
                  setImageFile(null); 
                  setImagePreview(''); 
                  setValidationErrors({});
                }} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <PermissionGuard permission="servicios.crear">
                <Button onClick={handleAdd} disabled={loading || uploading} className="bg-gradient-to-r from-red-700 to-red-500">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {loading ? t('services.messages.adding') : t('services.addService')}
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
            placeholder={t('services.searchServices')} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600" 
          />
        </div>
        <div className="space-y-4">
          {filteredServices.map((service, index) => (
            <motion.div 
              key={service.id_servicio} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="bg-white/50 rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={service.imagen_url || 'https://via.placeholder.com/100'} 
                  alt={service.nombre} 
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-800">{service.nombre}</h3>
                    {service.estado ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {t('services.visible')}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {t('services.hidden')}
                      </span>
                    )}
                  </div>
                  {service.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{service.descripcion}</p>
                  )}
                  <span className="text-lg font-bold gradient-text mt-1 inline-block">
                    ${formatSpanishPrice(service.precio)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <PermissionGuard permission="servicios.cambiar_estado">
                  <Button 
                    onClick={() => toggleVisibility(service.id_servicio)} 
                    variant="outline" 
                    size="sm"
                    title={service.estado ? 'Ocultar servicio' : 'Mostrar servicio'}
                  >
                    {service.estado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="servicios.editar">
                  <Button 
                    onClick={() => handleEdit(service)} 
                    variant="outline" 
                    size="sm"
                    title="Editar servicio"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="servicios.eliminar">
                  <Button 
                    onClick={() => handleDelete(service.id_servicio)} 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    title="Eliminar servicio"
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

export default ServicesAdmin;
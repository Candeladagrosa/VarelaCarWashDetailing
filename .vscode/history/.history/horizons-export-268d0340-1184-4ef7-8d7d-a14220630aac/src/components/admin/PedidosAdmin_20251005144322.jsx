import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Calendar, Tag, Trash2, Edit, Save, X, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentStatusOptions = ['Pendiente', 'Pagado'];
  const shippingStatusOptions = ['Pendiente', 'Entregado'];

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_productos (
          id_pedido_producto,
          id_producto,
          cantidad,
          precio,
          productos (
            nombre
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando pedidos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setPedidos(data || []);
    setLoading(false);
  };

  const updatePedidoStatus = async (id, type, newStatus) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ [type]: newStatus, updated_at: new Date().toISOString() })
      .eq('id_pedido', id);

    if (error) {
      console.error('Error actualizando estado:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo actualizar el estado', 
        variant: 'destructive' 
      });
      return;
    }

    await loadPedidos();
    toast({ 
      title: '¡Estado Actualizado! ✅', 
      description: `El estado de ${type === 'estado_pago' ? 'pago' : 'envío'} ha sido actualizado.` 
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id_pedido', id);

    if (error) {
      console.error('Error eliminando pedido:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo eliminar el pedido', 
        variant: 'destructive' 
      });
      return;
    }

    await loadPedidos();
    toast({ 
      title: 'Pedido Eliminado', 
      description: 'El pedido ha sido eliminado permanentemente.' 
    });
  };

  const handleEdit = (pedido) => {
    setEditingId(pedido.id_pedido);
    setEditData({ ...pedido });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    
    try {
      // 1. Actualizar el pedido principal
      const updatedTotal = editData.pedido_productos.reduce((sum, prod) => sum + prod.precio * prod.cantidad, 0);
      
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .update({ 
          total: updatedTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id_pedido', editingId);

      if (pedidoError) {
        console.error('Error actualizando pedido:', pedidoError);
        toast({ 
          title: 'Error', 
          description: 'No se pudo actualizar el pedido', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      // 2. Actualizar cantidades de productos
      for (const prod of editData.pedido_productos) {
        const { error } = await supabase
          .from('pedido_productos')
          .update({ cantidad: prod.cantidad })
          .eq('id_pedido_producto', prod.id_pedido_producto);

        if (error) {
          console.error('Error actualizando producto:', error);
        }
      }

      await loadPedidos();
      setEditingId(null);
      setEditData(null);
      setLoading(false);
      toast({ 
        title: '¡Pedido Actualizado! ✅', 
        description: 'Los detalles del pedido han sido modificados.' 
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({ 
        title: 'Error', 
        description: 'Ocurrió un error inesperado', 
        variant: 'destructive' 
      });
      setLoading(false);
    }
  };

  const handleProductQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedProductos = editData.productos.map(p => p.id_producto === productId ? { ...p, cantidad: newQuantity } : p);
    setEditData({ ...editData, productos: updatedProductos });
  };

  const handleRemoveProduct = (productId) => {
    const updatedProductos = editData.productos.filter(p => p.id_producto !== productId);
    setEditData({ ...editData, productos: updatedProductos });
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const search = searchTerm.toLowerCase();
    const hasClienteData = pedido.cliente_data;
    return (
      pedido.id_pedido.toString().includes(search) ||
      (hasClienteData && pedido.cliente_data.nombre.toLowerCase().includes(search)) ||
      (hasClienteData && pedido.cliente_data.apellido.toLowerCase().includes(search)) ||
      (hasClienteData && pedido.cliente_data.email.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
        <h2 className="text-2xl font-bold gradient-text mb-4">Gestión de Pedidos</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por ID, nombre, apellido o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" />
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredPedidos.length > 0 ? filteredPedidos.map((pedido, index) => {
          const isEditing = editingId === pedido.id_pedido;
          return (
            <motion.div key={pedido.id_pedido} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass-effect rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Pedido #{pedido.id_pedido}</h3>
                  {pedido.cliente_data && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600">
                      <div className="flex items-center space-x-2"><User className="w-4 h-4" /><span>{pedido.cliente_data.nombre} {pedido.cliente_data.apellido}</span></div>
                      <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{new Date(pedido.fecha_pedido).toLocaleDateString()}</span></div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold gradient-text">${(isEditing ? editData.productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0) : pedido.total).toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2 justify-end">
                    <label for="paymentStatus">Pago</label>
                    <select name="paymentStatus" value={pedido.estado_pago} onChange={(e) => updatePedidoStatus(pedido.id_pedido, 'estado_pago', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-sm">
                      {paymentStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <label for="shippingStatus">Envío</label>
                    <select name="shippingStatus" value={pedido.estado_envio} onChange={(e) => updatePedidoStatus(pedido.id_pedido, 'estado_envio', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-sm">
                      {shippingStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center"><Tag className="w-4 h-4 mr-2" />Productos:</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    {editData.productos.map((prod) => (
                      <div key={prod.id_producto} className="flex items-center justify-between">
                        <span>{prod.nombre}</span>
                        <div className="flex items-center space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => handleProductQuantityChange(prod.id_producto, prod.cantidad - 1)}><Minus className="w-4 h-4" /></Button>
                          <span>{prod.cantidad}</span>
                          <Button size="icon" variant="ghost" onClick={() => handleProductQuantityChange(prod.id_producto, prod.cantidad + 1)}><Plus className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleRemoveProduct(prod.id_producto)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-1 list-disc list-inside">
                    {pedido.productos && pedido.productos.map((prod, idx) => (
                      <li key={idx} className="text-gray-600">{prod.cantidad}x {prod.nombre} - ${prod.precio.toLocaleString()} c/u</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex space-x-2 mt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Guardar</Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="outline"><X className="w-4 h-4 mr-2" />Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => handleEdit(pedido)} size="sm" variant="outline"><Edit className="w-4 h-4 mr-2" />Editar</Button>
                    <Button onClick={() => handleDelete(pedido.id_pedido)} size="sm" variant="outline" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Eliminar</Button>
                  </>
                )}
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-10"><p className="text-gray-500">No se encontraron pedidos con ese criterio.</p></div>
        )}
      </div>
    </div>
  );
};

export default PedidosAdmin;
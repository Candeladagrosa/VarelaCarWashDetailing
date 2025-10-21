import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, X, Search, Edit, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const TurnosAdmin = () => {
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ fecha: '', hora: '' });
  const [loading, setLoading] = useState(false);

  const statusOptions = ['Pendiente', 'Confirmado', 'Cancelado', 'Realizado'];

  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = async () => {
    setLoading(true);
    
    // 1. Cargar turnos con servicios
    const { data: turnosData, error: turnosError } = await supabase
      .from('turnos')
      .select(`
        *,
        servicios (
          nombre
        )
      `)
      .order('created_at', { ascending: false });

    if (turnosError) {
      console.error('Error cargando turnos:', turnosError);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los turnos',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    // 2. Obtener IDs únicos de clientes
    const clienteIds = [...new Set(turnosData.map(t => t.id_cliente).filter(Boolean))];

    // 3. Cargar datos de usuarios desde la tabla usuarios (si existe) o usar un enfoque alternativo
    if (clienteIds.length > 0) {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, email')
        .in('id', clienteIds);

      if (!usuariosError && usuariosData) {
        // Crear un mapa de usuarios para acceso rápido
        const usuariosMap = {};
        usuariosData.forEach(u => {
          usuariosMap[u.id] = u;
        });
        setUsuarios(usuariosMap);
      } else {
        console.warn('No se pudieron cargar usuarios:', usuariosError);
        setUsuarios({});
      }
    }

    setTurnos(turnosData || []);
    setLoading(false);
  };

  const updateTurnoStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('turnos')
      .update({ 
        estado: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id_turno', id);

    if (error) {
      console.error('Error actualizando estado:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo actualizar el estado', 
        variant: 'destructive' 
      });
      return;
    }

    await loadTurnos();
    toast({ 
      title: '¡Estado Actualizado! ✅', 
      description: `El turno ha sido ${newStatus.toLowerCase()}` 
    });
  };

  const handleEdit = (turno) => {
    setEditingId(turno.id_turno);
    setEditData({ fecha: turno.fecha, hora: turno.hora });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('turnos')
      .update({ 
        fecha: editData.fecha, 
        hora: editData.hora, 
        updated_at: new Date().toISOString() 
      })
      .eq('id_turno', editingId);

    if (error) {
      console.error('Error actualizando turno:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo actualizar el turno', 
        variant: 'destructive' 
      });
      setLoading(false);
      return;
    }

    await loadTurnos();
    setEditingId(null);
    setLoading(false);
    toast({ 
      title: '¡Turno Actualizado! ✅', 
      description: 'La fecha y hora del turno han sido modificadas.' 
    });
  };

  const filteredTurnos = turnos.filter(turno => {
    const search = searchTerm.toLowerCase();
    const usuario = usuarios[turno.id_cliente];
    const servicio = turno.servicios;
    return (
      (usuario && (usuario.nombre?.toLowerCase().includes(search) || usuario.apellido?.toLowerCase().includes(search) || usuario.email?.toLowerCase().includes(search))) ||
      (servicio && servicio.nombre?.toLowerCase().includes(search)) ||
      turno.estado.toLowerCase().includes(search)
    );
  });

  if (loading && turnos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-16 h-16 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
        <h2 className="text-2xl font-bold gradient-text mb-4">Gestión de Turnos</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por cliente, servicio o estado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent" />
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredTurnos.length > 0 ? filteredTurnos.map((turno, index) => {
          const isEditing = editingId === turno.id_turno;
          const usuario = usuarios[turno.id_cliente];
          return (
            <motion.div key={turno.id_turno} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass-effect rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{turno.servicios?.nombre || 'Servicio'}</h3>
                  <p className="text-gray-700 font-semibold">
                    {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente no encontrado'}
                  </p>
                  {usuario?.email && (
                    <p className="text-gray-500 text-sm">{usuario.email}</p>
                  )}
                  {isEditing ? (
                    <div className="flex flex-wrap gap-4 mt-2">
                      <input type="date" value={editData.fecha} onChange={(e) => setEditData({ ...editData, fecha: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300" />
                      <input type="time" value={editData.hora} onChange={(e) => setEditData({ ...editData, hora: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4 text-gray-600 mt-1">
                      <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{new Date(turno.fecha).toLocaleDateString()}</span></div>
                      <div className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>{turno.hora}</span></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <select value={turno.estado} onChange={(e) => updateTurnoStatus(turno.id_turno, e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 bg-white">
                    {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setEditingId(null)} size="sm" variant="outline" disabled={loading}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleEdit(turno)} size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-10"><p className="text-gray-500">No se encontraron turnos con ese criterio.</p></div>
        )}
      </div>
    </div>
  );
};

export default TurnosAdmin;
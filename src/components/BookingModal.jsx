
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useTranslation } from 'react-i18next';

const BookingModal = ({ service, onClose, onConfirm, loading = false }) => {
  const { t } = useTranslation();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  /**
   * Verifica si ya existe un turno para la fecha y hora seleccionadas
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {string} hora - Hora en formato HH:MM
   * @returns {Promise<boolean>} true si el espacio está ocupado
   */
  const checkSlotAvailability = async (fecha, hora) => {
    const { data, error } = await supabase
      .from('turnos')
      .select('id_turno')
      .eq('fecha', fecha)
      .eq('hora', hora)
      .in('estado', ['Pendiente', 'Confirmado']); // Estados con mayúscula como en DB

    if (error) {
      console.error('Error verificando disponibilidad:', error);
      return false; // En caso de error, permitir la reserva
    }

    return data && data.length > 0;
  };

  /**
   * Valida que la fecha y hora sean futuras
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {string} hora - Hora en formato HH:MM
   * @returns {boolean} true si es válido
   */
  const validateDateTime = (fecha, hora) => {
    const _selectedDateTime = new Date(`${fecha}T${hora}`);
    const _now = new Date();
    
    return _selectedDateTime > _now;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!fecha || !hora) {
      toast({
        title: t('errors.titles.validationError'),
        description: t('bookings.validation.dateRequired'),
        variant: 'destructive',
      });
      return;
    }

    // Validar que la fecha/hora sea futura
    if (!validateDateTime(fecha, hora)) {
      toast({
        title: t('errors.titles.validationError'),
        description: t('bookings.validation.pastDateTime'),
        variant: 'destructive',
      });
      return;
    }

    // Verificar disponibilidad del espacio temporal
    const _isSlotTaken = await checkSlotAvailability(fecha, hora);
    if (_isSlotTaken) {
      toast({
        title: t('errors.titles.validationError'),
        description: t('bookings.validation.slotTaken'),
        variant: 'destructive',
      });
      return;
    }

    onConfirm({ fecha, hora });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-effect rounded-2xl p-8 max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold gradient-text">{t('bookings.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-gray-50 rounded-xl">
            <h3 className="font-bold text-lg mb-1">{service.nombre}</h3>
            <p className="text-gray-600 text-sm mb-2">{service.descripcion}</p>
            <p className="text-2xl font-bold gradient-text">
              ${service.precio.toLocaleString('es-AR')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{t('bookings.selectDate')}</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={today}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{t('bookings.selectTime')}</span>
              </label>
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
              >
                <option value="">Seleccionar hora</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                {t('bookings.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950"
              >
                {loading ? t('common.loading') : t('bookings.confirm')}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
  
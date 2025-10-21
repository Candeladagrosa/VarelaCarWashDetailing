import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ServiceCard from '@/components/ServiceCard';
import BookingModal from '@/components/BookingModal';
import { supabase } from '@/lib/customSupabaseClient';

const ServicesPage = ({ user, setCurrentPage }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('estado', true)
        .eq('visible', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error cargando servicios:', error);
        setLoading(false);
        return;
      }
      
      setServices(data || []);
      setLoading(false);
    };

    loadServices();
  }, []);

  const handleBookService = (service) => {
    if (!user) {
      toast({
        title: '¡Atención!',
        description: 'Debes iniciar sesión para reservar un turno',
        variant: 'destructive',
      });
      setCurrentPage('login');
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (bookingData) => {
    const turnos = JSON.parse(localStorage.getItem('turnos') || '[]');
    const newTurno = {
      id_turno: turnos.length > 0 ? Math.max(...turnos.map(t => t.id_turno)) + 1 : 1,
      id_cliente: user.id_usuario,
      id_servicio: selectedService.id_servicio,
      fecha: bookingData.fecha,
      hora: bookingData.hora,
      estado: 'Pendiente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    turnos.push(newTurno);
    localStorage.setItem('turnos', JSON.stringify(turnos));

    toast({
      title: '¡Turno Reservado! 🎉',
      description: `Tu turno para ${selectedService.nombre} ha sido confirmado`,
    });

    setShowBookingModal(false);
    setSelectedService(null);
  };

  return (
    <>
      <Helmet>
        <title>Servicios - Varela Car Wash & Detailing</title>
        <meta name="description" content="Descubre nuestros servicios premium de car wash y detailing. Reserva tu turno online de forma rápida y sencilla." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
              Nuestros Servicios
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Servicios profesionales de car wash y detailing diseñados para mantener tu vehículo impecable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.filter(s => s.estado === 1 && s.visible).map((service, index) => (
              <ServiceCard
                key={service.id_servicio}
                service={service}
                index={index}
                onBook={handleBookService}
              />
            ))}
          </div>

          {services.filter(s => s.estado === 1 && s.visible).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-2xl text-gray-500">
                No hay servicios disponibles en este momento
              </p>
            </motion.div>
          )}
        </div>

        {showBookingModal && (
          <BookingModal
            service={selectedService}
            onClose={() => setShowBookingModal(false)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </>
  );
};

export default ServicesPage;
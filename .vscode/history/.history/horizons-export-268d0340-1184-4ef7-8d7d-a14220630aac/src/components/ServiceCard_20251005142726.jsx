import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServiceCard = ({ service, index, onBook }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="glass-effect rounded-2xl p-6 card-hover overflow-hidden"
    >
      <img src={service.imagen_url || 'https://via.placeholder.com/400x200'} alt={service.nombre} className="w-full h-40 object-cover rounded-lg mb-4" />
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {service.nombre}
        </h3>
        <p className="text-gray-600">
          {service.descripcion}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold gradient-text">
            ${service.precio.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        onClick={() => onBook(service)}
        className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Reservar Turno
      </Button>
    </motion.div>
  );
};

export default ServiceCard;
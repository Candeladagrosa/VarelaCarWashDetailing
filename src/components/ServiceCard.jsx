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
      whileHover={{ scale: 1.03, transition: { duration: 0.1 } }}
      className="glass-effect rounded-2xl overflow-hidden card-hover flex flex-col"
    >
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <img 
          className="w-full h-full object-cover"
          alt={service.nombre}
          src={service.imagen_url || "https://images.unsplash.com/photo-1586717056756-6ec619908bd3"} />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {service.nombre}
        </h3>
        <p className="text-gray-600 mb-4 flex-grow">
          {service.descripcion}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold gradient-text">
              ${service.precio.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={() => onBook(service)}
            className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Reservar Turno
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
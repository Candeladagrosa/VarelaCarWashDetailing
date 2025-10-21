
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = ({ setCurrentPage }) => {
  const features = [
    {
      icon: Calendar,
      title: 'Reserva Online',
      description: 'Agenda tu turno de forma rápida y sencilla',
      color: 'from-purple-500 to-blue-500',
    },
    {
      icon: ShoppingBag,
      title: 'Tienda Premium',
      description: 'Productos profesionales para el cuidado de tu auto',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'Lavado Premium',
      description: 'Servicio completo con cera y pulido profesional',
      color: 'from-red-700 to-red-900',
    },
    {
      icon: Droplet,
      title: 'Lavado Express',
      description: 'Limpieza rápida y efectiva para el día a día',
      color: 'from-gray-700 to-gray-900',
    },
    {
      icon: Star,
      title: 'Detailing Completo',
      description: 'Restauración y protección total del vehículo',
      color: 'from-red-900 to-black',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Inicio - Varela Car Wash & Detailing</title>
        <meta name="description" content="Bienvenido a Varela Car Wash. Servicios premium de lavado y detailing. Reserva tu turno online y compra productos profesionales." />
      </Helmet>

      <div className="min-h-screen">
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Servicios Premium de Car Wash</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
                Tu Auto Merece
                <br />
                Lo Mejor
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Servicios profesionales de lavado y detailing. Reserva online, compra productos premium y dale a tu vehículo el cuidado que se merece.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setCurrentPage('services')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 shadow-xl"
                >
                  Reservar Turno
                </Button>
                <Button
                  onClick={() => setCurrentPage('products')}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-purple-600 hover:bg-purple-50"
                >
                  Ver Productos
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-20"
            >
              <img 
                className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl"
                alt="Car wash service showcase"
               src="https://images.unsplash.com/photo-1652898072061-785998d820cb" />
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                ¿Por Qué Elegirnos?
              </h2>
              <p className="text-xl text-gray-600">
                Experiencia, calidad y tecnología al servicio de tu vehículo
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-effect p-8 rounded-2xl card-hover"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-effect rounded-3xl p-12 text-center bg-gradient-to-br from-purple-600/10 to-blue-600/10"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                ¿Listo para Comenzar?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a miles de clientes satisfechos que confían en nosotros para el cuidado de sus vehículos
              </p>
              <Button
                onClick={() => setCurrentPage('services')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-12 py-6 shadow-xl"
              >
                Reservar Ahora
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
  
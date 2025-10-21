import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/customSupabaseClient';

const ProductsPage = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('estado', true)
        .gt('stock', 0) // Solo productos con stock > 0
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error cargando productos:', error);
        setLoading(false);
        return;
      }
      
      setProducts(data || []);
      setLoading(false);
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Productos - Varela Car Wash & Detailing</title>
        </Helmet>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-16 h-16 animate-spin text-red-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Productos - Varela Car Wash & Detailing</title>
        <meta name="description" content="Compra productos premium para el cuidado de tu vehículo. Shampoos, ceras, pulidos y más productos profesionales." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
              Productos Premium
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Los mejores productos profesionales para el cuidado y mantenimiento de tu vehículo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
                <ProductCard
                  key={product.id_producto}
                  product={product}
                  index={index}
                  onAddToCart={addToCart}
                />
              ))}
          </div>

          {!loading && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
              <p className="text-2xl text-gray-500">
                No hay productos disponibles en este momento
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
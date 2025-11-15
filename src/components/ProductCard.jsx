import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ProductCard = ({ product, index, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    toast({
      title: '¡Agregado al carrito! 🛒',
      description: `${quantity} x ${product.nombre}`,
    });
    setQuantity(1);
  };

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
          alt={product.nombre}
          src={product.imagen_url || "https://images.unsplash.com/photo-1586717056756-6ec619908bd3"} />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {product.nombre}
        </h3>
        <p className="text-gray-600 mb-4 flex-grow">
          {product.descripcion}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-3xl font-bold gradient-text">
                ${product.precio_actual.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Stock: {product.stock}
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-semibold w-12 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
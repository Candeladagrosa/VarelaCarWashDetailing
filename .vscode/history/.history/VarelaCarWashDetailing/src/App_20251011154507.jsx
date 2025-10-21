import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ProductsPage from '@/pages/ProductsPage';
import CartPage from '@/pages/CartPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPanel from '@/pages/AdminPanel';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from './lib/customSupabaseClient';

function App() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔄 Iniciando carga de perfil. User:', user?.id);
      if (user) {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('❌ Error cargando perfil:', error);
        }
        
        if (data) {
          setProfile(data);
          console.log('✅ Perfil cargado exitosamente:', {
            id: data.id,
            nombre: data.nombre,
            apellido: data.apellido,
            id_rol: data.id_rol
          });
        } else {
          console.warn('⚠️ No se encontró perfil para el usuario:', user.id);
        }
        setLoadingProfile(false);
      } else {
        console.log('👤 No hay usuario autenticado, limpiando perfil');
        setProfile(null);
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, session]);

  // Debug: monitorear cambios en el estado del perfil
  useEffect(() => {
    console.log('📊 Estado actual del perfil:', profile);
  }, [profile]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id_producto === product.id_producto);
      if (existingItem) {
        return prevCart.map(item =>
          item.id_producto === product.id_producto
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, cantidad: quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id_producto !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id_producto === productId ? { ...item, cantidad: quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id_producto !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <>
      <Helmet>
        <title>Varela Car Wash & Detailing - Servicios Premium de Lavado</title>
        <meta name="description" content="Plataforma profesional de car wash y detailing. Reserva turnos, compra productos premium y gestiona tu vehículo con los mejores servicios." />
      </Helmet>
      <Router>
        <div className="min-h-screen">
          <Navbar
            user={user}
            profile={profile}
            cartItemsCount={cart.reduce((sum, item) => sum + item.cantidad, 0)}
          />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage user={user} />} />
              <Route path="/products" element={<ProductsPage addToCart={addToCart} />} />
              <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} user={user} />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute 
                    permissions={[
                      'productos.ver_listado',
                      'servicios.ver_listado',
                      'usuarios.ver_listado',
                      'turnos.ver_listado',
                      'pedidos.ver_listado',
                      'roles.ver_listado'
                    ]}
                    requireAll={false}
                  >
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;
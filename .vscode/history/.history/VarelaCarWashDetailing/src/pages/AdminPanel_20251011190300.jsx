import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, Package, Wrench, Users, Calendar, ShoppingBag, Key, FileBarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsAdmin from '@/components/admin/ProductsAdmin';
import ServicesAdmin from '@/components/admin/ServicesAdmin';
import UsersAdmin from '@/components/admin/UsersAdmin';
import TurnosAdmin from '@/components/admin/TurnosAdmin';
import PedidosAdmin from '@/components/admin/PedidosAdmin';
import RolesAdmin from '@/components/admin/RolesAdmin';
import PermissionsAdmin from '@/components/admin/PermissionsAdmin';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGuard from '@/components/PermissionGuard';

const AdminPanel = () => {
  const { canAccess, loading } = usePermissions();

  // Determinar el tab por defecto según los permisos del usuario
  const getDefaultTab = () => {
    if (canAccess('productos')) return 'products';
    if (canAccess('servicios')) return 'services';
    if (canAccess('usuarios')) return 'users';
    if (canAccess('turnos')) return 'turnos';
    if (canAccess('pedidos')) return 'pedidos';
    if (canAccess('roles')) return 'roles';
    return 'products'; // Fallback
  };

  return (
    <>
      <Helmet>
        <title>Panel Administrativo - Varela Car Wash</title>
        <meta name="description" content="Panel de administración para gestionar productos, servicios, usuarios y turnos." />
      </Helmet>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">
                  Panel Administrativo
                </h1>
                <p className="text-gray-600">
                  Gestión completa del sistema
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue={getDefaultTab()} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-7 glass-effect p-2">
              <PermissionGuard permission="productos.ver_listado">
                <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Package className="w-4 h-4 mr-2" />
                  Productos
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="servicios.ver_listado">
                <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Wrench className="w-4 h-4 mr-2" />
                  Servicios
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="usuarios.ver_listado">
                <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Usuarios
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="turnos.ver_listado">
                <TabsTrigger value="turnos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Turnos
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="pedidos.ver_listado">
                <TabsTrigger value="pedidos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Pedidos
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="roles.ver_listado">
                <TabsTrigger value="roles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Roles
                </TabsTrigger>
              </PermissionGuard>

              <PermissionGuard permission="roles.asignar_permisos">
                <TabsTrigger value="permissions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Key className="w-4 h-4 mr-2" />
                  Permisos
                </TabsTrigger>
              </PermissionGuard>
            </TabsList>

            <PermissionGuard permission="productos.ver_listado">
              <TabsContent value="products">
                <ProductsAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="servicios.ver_listado">
              <TabsContent value="services">
                <ServicesAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="usuarios.ver_listado">
              <TabsContent value="users">
                <UsersAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="turnos.ver_listado">
              <TabsContent value="turnos">
                <TurnosAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="pedidos.ver_listado">
              <TabsContent value="pedidos">
                <PedidosAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="roles.ver_listado">
              <TabsContent value="roles">
                <RolesAdmin />
              </TabsContent>
            </PermissionGuard>

            <PermissionGuard permission="roles.asignar_permisos">
              <TabsContent value="permissions">
                <PermissionsAdmin />
              </TabsContent>
            </PermissionGuard>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
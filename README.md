# Varela Car Wash & Detailing 🚗✨

Plataforma web profesional para servicios de lavado de autos y detailing. Sistema completo de gestión de turnos, venta de productos y administración con autenticación y control de permisos basado en roles.

## 🌟 Características Principales

### Para Clientes
- 🏠 **Página de inicio** con información del negocio
- 📅 **Reserva de turnos** para servicios de car wash y detailing
- 🛍️ **Tienda de productos** premium para el cuidado vehicular
- 🛒 **Carrito de compras** con gestión de productos
- 👤 **Perfil de usuario** personalizado
- 📜 **Historial** de servicios y compras realizadas

### Para Administradores
- 👥 **Gestión de usuarios** y perfiles
- 🔐 **Sistema de roles y permisos** granular
- 🧼 **Administración de servicios** ofrecidos
- 📦 **Gestión de productos** del catálogo
- 📆 **Control de turnos** y reservas
- 🛒 **Gestión de pedidos** de clientes
- 📊 **Reportes** y estadísticas

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento de la aplicación
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones fluidas
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos

### Backend & Autenticación
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

### Herramientas
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **XLSX** - Exportación de datos a Excel

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Supabase (para backend)

## � Variables de Entorno

El proyecto utiliza las siguientes variables de entorno:

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | ✅ |

Puedes obtener estas credenciales desde el dashboard de Supabase:
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Settings > API
3. Copia la URL y la clave `anon` key

## �🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Candeladagrosa/VarelaCarWashDetailing.git
cd VarelaCarWashDetailing
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo de ejemplo y configura tus credenciales de Supabase:
```bash
cp .env.example .env
```

Edita el archivo `.env` y reemplaza con tus credenciales:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

> **⚠️ Importante:** Nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Scripts Disponibles

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🗂️ Estructura del Proyecto

```
VarelaCarWashDetailing/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── admin/          # Componentes del panel administrativo
│   │   └── ui/             # Componentes de UI (botones, tabs, toast)
│   ├── contexts/           # Contextos de React (Auth)
│   ├── hooks/              # Custom hooks (usePermissions)
│   ├── lib/                # Utilidades y configuración
│   │   ├── customSupabaseClient.js
│   │   ├── exportUtils.js
│   │   └── utils.js
│   ├── pages/              # Páginas principales de la app
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── plugins/                # Plugins de Vite personalizados
├── public/                 # Archivos estáticos
├── tools/                  # Herramientas de desarrollo
├── .env                    # Variables de entorno (no se sube a git)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por git
└── package.json
```

## 🔐 Sistema de Permisos

La aplicación implementa un sistema robusto de permisos basado en roles:

- `productos.ver_listado` - Ver lista de productos
- `servicios.ver_listado` - Ver lista de servicios
- `usuarios.ver_listado` - Ver lista de usuarios
- `turnos.ver_listado` - Ver lista de turnos
- `pedidos.ver_listado` - Ver lista de pedidos
- `roles.ver_listado` - Ver lista de roles

Los permisos se gestionan desde el panel administrativo y se validan tanto en el frontend como en el backend mediante Row Level Security de Supabase.

## 🗄️ Base de Datos

### Tablas Principales

- **perfiles** - Información de usuarios
- **servicios** - Catálogo de servicios
- **productos** - Catálogo de productos
- **turnos** - Reservas de servicios
- **pedidos** - Órdenes de compra
- **roles** - Roles del sistema
- **permisos** - Permisos granulares
- **rol_permisos** - Relación roles-permisos

## 🎨 Características de UI/UX

- 🎭 Diseño moderno y responsive
- 🌙 Interfaz limpia con Tailwind CSS
- ⚡ Animaciones suaves con Framer Motion
- 📱 Completamente mobile-friendly
- ♿ Componentes accesibles con Radix UI
- 🔔 Sistema de notificaciones toast

## 🛡️ Seguridad

- ✅ Autenticación segura con Supabase Auth
- ✅ Row Level Security en la base de datos
- ✅ Validación de permisos en cada ruta protegida
- ✅ Tokens JWT para sesiones
- ✅ HTTPS en producción

## 📈 Próximas Características

- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con pasarelas de pago
- [ ] Programa de fidelización de clientes
- [ ] Chat de soporte en vivo
- [ ] App móvil nativa (React Native)
- [ ] Dashboard de analíticas avanzadas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- Código en **inglés** (variables, clases, métodos)
- Comentarios en **español**
- PascalCase para componentes React
- camelCase para funciones y variables
- Usar componentes funcionales con hooks
- Documentar componentes complejos

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👨‍💻 Autor

**Candelaria Dagrosa**
- GitHub: [@Candeladagrosa](https://github.com/Candeladagrosa)

## 🙏 Agradecimientos

- Supabase por su excelente plataforma BaaS
- Radix UI por componentes accesibles
- Comunidad de React y Vite

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

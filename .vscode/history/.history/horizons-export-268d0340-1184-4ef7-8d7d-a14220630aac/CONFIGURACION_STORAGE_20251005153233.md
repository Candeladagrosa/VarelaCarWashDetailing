# Configuración de Supabase Storage para Imágenes

## 📋 Paso 1: Crear Bucket de Storage

1. Ve a tu **Dashboard de Supabase**
2. En el menú lateral, selecciona **Storage**
3. Click en el botón **"Create bucket"** (o "New bucket")
4. Configura el bucket:
   - **Name**: `imagenes`
   - **Public bucket**: ✅ **SÍ** (marca la casilla)
   - Esto permite que las imágenes sean accesibles públicamente sin autenticación
5. Click en **"Create bucket"**

## 📋 Paso 2: Configurar Políticas RLS (Row Level Security)

Una vez creado el bucket, necesitas configurar las políticas de seguridad:

1. Ve a **SQL Editor** en el menú lateral de Supabase
2. Click en **"New query"**
3. Copia y pega el siguiente código SQL:

```sql
-- Permitir a todos ver las imágenes (lectura pública)
CREATE POLICY "Las imágenes son públicamente accesibles"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagenes');

-- Permitir a usuarios autenticados actualizar imágenes
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagenes');

-- Permitir a usuarios autenticados eliminar imágenes
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagenes');
```

4. Click en **"Run"** para ejecutar las políticas

## ✅ Verificación

Para verificar que todo está configurado correctamente:

1. Ve a **Storage** → **imagenes** (tu bucket)
2. Intenta subir una imagen de prueba manualmente
3. Si puedes subirla y verla, ¡está todo listo! ✅

## 📁 Estructura de Carpetas

El sistema automáticamente organizará las imágenes en carpetas:

```
imagenes/
├── productos/
│   ├── abc123-1234567890.jpg
│   ├── xyz789-0987654321.png
│   └── ...
└── servicios/
    ├── def456-1122334455.jpg
    ├── ghi789-9988776655.webp
    └── ...
```

## 🎨 Funcionamiento en la App

### Para Productos (ProductsAdmin):
1. El admin selecciona una imagen desde su computadora
2. Ve una **vista previa** antes de guardar
3. Al guardar, la imagen se sube a `imagenes/productos/`
4. La URL pública se guarda en la base de datos

### Para Servicios (ServicesAdmin):
1. El admin selecciona una imagen desde su computadora
2. Ve una **vista previa** antes de guardar
3. Al guardar, la imagen se sube a `imagenes/servicios/`
4. La URL pública se guarda en la base de datos

## 🔒 Seguridad

- ✅ Solo usuarios **autenticados** pueden subir imágenes
- ✅ Las imágenes son **públicas** para lectura (necesario para mostrarlas en la web)
- ✅ Validaciones automáticas:
  - Solo archivos de imagen (jpg, png, gif, webp, etc.)
  - Tamaño máximo: **5 MB**
  - Nombres únicos para evitar sobrescrituras

## 🚀 Uso en la Aplicación

Los componentes **ProductsAdmin** y **ServicesAdmin** ahora incluyen:

- Input de archivo con estilo personalizado
- Vista previa de imagen antes de guardar
- Indicador de carga mientras sube
- Validaciones de tipo y tamaño
- Mensajes de error claros

¡Todo está listo para usarse! 🎉

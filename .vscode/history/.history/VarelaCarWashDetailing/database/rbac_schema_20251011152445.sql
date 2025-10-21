-- ============================================
-- Sistema RBAC - Varela Car Wash & Detailing
-- ============================================

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT false, -- Roles del sistema no se pueden eliminar
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Permisos
CREATE TABLE IF NOT EXISTS public.permisos (
    id_permiso SERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL, -- ej: 'productos.crear', 'turnos.editar'
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(50) NOT NULL, -- 'productos', 'servicios', 'usuarios', etc.
    accion VARCHAR(50) NOT NULL, -- 'ver', 'crear', 'editar', 'eliminar', etc.
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla intermedia Rol-Permisos (muchos a muchos)
CREATE TABLE IF NOT EXISTS public.rol_permisos (
    id_rol INTEGER REFERENCES public.roles(id_rol) ON DELETE CASCADE,
    id_permiso INTEGER REFERENCES public.permisos(id_permiso) ON DELETE CASCADE,
    asignado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    asignado_por UUID REFERENCES auth.users(id),
    PRIMARY KEY (id_rol, id_permiso)
);

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS public.auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id),
    tabla VARCHAR(100) NOT NULL,
    accion VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    registro_id INTEGER,
    datos_anteriores JSONB, -- Datos antes del cambio
    datos_nuevos JSONB, -- Datos después del cambio
    ip_address INET,
    user_agent TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_permisos_modulo ON public.permisos(modulo);
CREATE INDEX IF NOT EXISTS idx_permisos_codigo ON public.permisos(codigo);
CREATE INDEX IF NOT EXISTS idx_rol_permisos_rol ON public.rol_permisos(id_rol);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON public.auditoria(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON public.auditoria(creado_en);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp en roles
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas para ROLES
-- Todos pueden ver roles activos
CREATE POLICY "Roles visibles para usuarios autenticados"
    ON public.roles FOR SELECT
    TO authenticated
    USING (activo = true);

-- Solo admins pueden insertar/actualizar/eliminar roles
CREATE POLICY "Solo admins pueden gestionar roles"
    ON public.roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.id_rol = 1 -- ID del rol Admin
        )
    );

-- Políticas para PERMISOS
-- Todos los autenticados pueden ver permisos
CREATE POLICY "Permisos visibles para usuarios autenticados"
    ON public.permisos FOR SELECT
    TO authenticated
    USING (true);

-- Solo admins pueden gestionar permisos
CREATE POLICY "Solo admins pueden gestionar permisos"
    ON public.permisos FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.id_rol = 1
        )
    );

-- Políticas para ROL_PERMISOS
-- Todos pueden ver asignaciones de permisos
CREATE POLICY "Asignaciones visibles para usuarios autenticados"
    ON public.rol_permisos FOR SELECT
    TO authenticated
    USING (true);

-- Solo admins pueden gestionar asignaciones
CREATE POLICY "Solo admins pueden gestionar asignaciones"
    ON public.rol_permisos FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.id_rol = 1
        )
    );

-- Políticas para AUDITORIA
-- Los usuarios solo pueden ver su propia auditoría
CREATE POLICY "Usuarios ven su propia auditoría"
    ON public.auditoria FOR SELECT
    TO authenticated
    USING (usuario_id = auth.uid());

-- Admins pueden ver toda la auditoría
CREATE POLICY "Admins ven toda la auditoría"
    ON public.auditoria FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.id_rol = 1
        )
    );

-- Solo el sistema puede insertar en auditoría
CREATE POLICY "Sistema puede insertar auditoría"
    ON public.auditoria FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- COMENTARIOS EN TABLAS Y COLUMNAS
-- ============================================

COMMENT ON TABLE public.roles IS 'Catálogo de roles del sistema';
COMMENT ON TABLE public.permisos IS 'Catálogo de permisos granulares';
COMMENT ON TABLE public.rol_permisos IS 'Asignación de permisos a roles';
COMMENT ON TABLE public.auditoria IS 'Registro de auditoría de cambios';

COMMENT ON COLUMN public.roles.es_sistema IS 'Indica si el rol es del sistema y no puede eliminarse';
COMMENT ON COLUMN public.permisos.codigo IS 'Código único del permiso en formato modulo.accion';
COMMENT ON COLUMN public.auditoria.datos_anteriores IS 'Estado del registro antes del cambio';
COMMENT ON COLUMN public.auditoria.datos_nuevos IS 'Estado del registro después del cambio';

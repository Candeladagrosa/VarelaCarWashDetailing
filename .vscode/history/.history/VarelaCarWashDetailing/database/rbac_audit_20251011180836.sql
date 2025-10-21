-- ============================================
-- SISTEMA DE AUDITORÍA
-- Triggers para registrar cambios automáticamente
-- ============================================

-- Función genérica para auditoría
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
    v_registro_id INTEGER;
BEGIN
    -- Obtener el ID del usuario actual
    v_user_id := auth.uid();
    
    -- Intentar obtener el ID del registro de forma dinámica
    -- basándose en nombres comunes de columnas ID
    BEGIN
        CASE TG_TABLE_NAME
            WHEN 'productos' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_producto 
                    ELSE NEW.id_producto 
                END;
            WHEN 'servicios' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_servicio 
                    ELSE NEW.id_servicio 
                END;
            WHEN 'turnos' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_turno 
                    ELSE NEW.id_turno 
                END;
            WHEN 'pedidos' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_pedido 
                    ELSE NEW.id_pedido 
                END;
            WHEN 'roles' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_rol 
                    ELSE NEW.id_rol 
                END;
            WHEN 'permisos' THEN
                v_registro_id := CASE TG_OP 
                    WHEN 'DELETE' THEN OLD.id_permiso 
                    ELSE NEW.id_permiso 
                END;
            ELSE
                -- Para otras tablas, intentar usar NULL
                v_registro_id := NULL;
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            -- Si hay algún error, usar NULL
            v_registro_id := NULL;
    END;
    
    -- Preparar datos según el tipo de operación
    IF (TG_OP = 'DELETE') THEN
        v_old_data := row_to_json(OLD)::JSONB;
        v_new_data := NULL;
        
        INSERT INTO public.auditoria (
            usuario_id,
            tabla,
            accion,
            registro_id,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            v_user_id,
            TG_TABLE_NAME,
            TG_OP,
            v_registro_id,
            v_old_data,
            v_new_data
        );
        
        RETURN OLD;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data := row_to_json(OLD)::JSONB;
        v_new_data := row_to_json(NEW)::JSONB;
        
        INSERT INTO public.auditoria (
            usuario_id,
            tabla,
            accion,
            registro_id,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            v_user_id,
            TG_TABLE_NAME,
            TG_OP,
            v_registro_id,
            v_old_data,
            v_new_data
        );
        
        RETURN NEW;
        
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_data := NULL;
        v_new_data := row_to_json(NEW)::JSONB;
        
        INSERT INTO public.auditoria (
            usuario_id,
            tabla,
            accion,
            registro_id,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            v_user_id,
            TG_TABLE_NAME,
            TG_OP,
            v_registro_id,
            v_old_data,
            v_new_data
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS DE AUDITORÍA POR TABLA
-- ============================================

-- Auditoría para PRODUCTOS
DROP TRIGGER IF EXISTS audit_productos_trigger ON public.productos;
CREATE TRIGGER audit_productos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para SERVICIOS
DROP TRIGGER IF EXISTS audit_servicios_trigger ON public.servicios;
CREATE TRIGGER audit_servicios_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.servicios
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para TURNOS
DROP TRIGGER IF EXISTS audit_turnos_trigger ON public.turnos;
CREATE TRIGGER audit_turnos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.turnos
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para PEDIDOS
DROP TRIGGER IF EXISTS audit_pedidos_trigger ON public.pedidos;
CREATE TRIGGER audit_pedidos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para PERFILES (cambios de rol)
DROP TRIGGER IF EXISTS audit_perfiles_trigger ON public.perfiles;
CREATE TRIGGER audit_perfiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para ROLES
DROP TRIGGER IF EXISTS audit_roles_trigger ON public.roles;
CREATE TRIGGER audit_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- Auditoría para ROL_PERMISOS
DROP TRIGGER IF EXISTS audit_rol_permisos_trigger ON public.rol_permisos;
CREATE TRIGGER audit_rol_permisos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.rol_permisos
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_func();

-- ============================================
-- VISTAS ÚTILES PARA CONSULTAR AUDITORÍA
-- ============================================

-- Vista para ver auditoría con información del usuario
CREATE OR REPLACE VIEW public.v_auditoria_detallada AS
SELECT 
    a.id_auditoria,
    a.tabla,
    a.accion,
    a.registro_id,
    a.datos_anteriores,
    a.datos_nuevos,
    a.creado_en,
    p.nombre || ' ' || p.apellido as usuario_nombre,
    au.email as usuario_email,
    r.nombre as rol_usuario
FROM public.auditoria a
LEFT JOIN public.perfiles p ON a.usuario_id = p.id
LEFT JOIN auth.users au ON a.usuario_id = au.id
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
ORDER BY a.creado_en DESC;

-- Vista para ver cambios recientes
CREATE OR REPLACE VIEW public.v_auditoria_reciente AS
SELECT 
    a.id_auditoria,
    a.tabla,
    a.accion,
    a.registro_id,
    a.creado_en,
    p.nombre || ' ' || p.apellido as usuario,
    r.nombre as rol
FROM public.auditoria a
LEFT JOIN public.perfiles p ON a.usuario_id = p.id
LEFT JOIN public.roles r ON p.id_rol = r.id_rol
WHERE a.creado_en >= NOW() - INTERVAL '7 days'
ORDER BY a.creado_en DESC;

-- Vista para estadísticas de auditoría
CREATE OR REPLACE VIEW public.v_auditoria_estadisticas AS
SELECT 
    tabla,
    accion,
    COUNT(*) as cantidad,
    MAX(creado_en) as ultimo_cambio
FROM public.auditoria
GROUP BY tabla, accion
ORDER BY tabla, accion;

-- ============================================
-- FUNCIÓN PARA OBTENER PERMISOS DE UN USUARIO
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE (
    codigo_permiso VARCHAR,
    nombre_permiso VARCHAR,
    modulo VARCHAR,
    accion VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.codigo,
        p.nombre,
        p.modulo,
        p.accion
    FROM public.permisos p
    INNER JOIN public.rol_permisos rp ON p.id_permiso = rp.id_permiso
    INNER JOIN public.perfiles pf ON rp.id_rol = pf.id_rol
    WHERE pf.id = user_id
    AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id_rol = pf.id_rol AND r.activo = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA VERIFICAR SI UN USUARIO TIENE UN PERMISO
-- ============================================

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.permisos p
        INNER JOIN public.rol_permisos rp ON p.id_permiso = rp.id_permiso
        INNER JOIN public.perfiles pf ON rp.id_rol = pf.id_rol
        INNER JOIN public.roles r ON pf.id_rol = r.id_rol
        WHERE pf.id = user_id
        AND p.codigo = permission_code
        AND r.activo = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON FUNCTION public.audit_trigger_func() IS 'Función genérica para registrar cambios en auditoría';
COMMENT ON FUNCTION public.get_user_permissions(UUID) IS 'Obtiene todos los permisos de un usuario';
COMMENT ON FUNCTION public.user_has_permission(UUID, VARCHAR) IS 'Verifica si un usuario tiene un permiso específico';
COMMENT ON VIEW public.v_auditoria_detallada IS 'Vista de auditoría con información completa del usuario';
COMMENT ON VIEW public.v_auditoria_reciente IS 'Vista de cambios de los últimos 7 días';
COMMENT ON VIEW public.v_auditoria_estadisticas IS 'Vista de estadísticas de auditoría por tabla y acción';

-- ============================================
-- CORRECCIÓN URGENTE: Función de Auditoría
-- Ejecuta este script para corregir el error al guardar roles
-- ============================================

-- Reemplazar la función de auditoría con una versión que soporte todas las tablas
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

-- Verificar que la función se actualizó correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'audit_trigger_func';

-- Mensaje de confirmación
SELECT '✅ Función de auditoría corregida exitosamente' as mensaje;
SELECT '✅ Ahora puedes crear/editar roles sin errores' as mensaje;

-- =====================================================
-- Función: create_profile
-- Descripción: Crea un perfil de usuario con rol Cliente (id_rol=3) por defecto
-- Autor: Sistema
-- Fecha: 2024
-- =====================================================

-- Paso 1: Buscar y eliminar TODAS las versiones existentes de create_profile
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT oid::regprocedure 
        FROM pg_proc 
        WHERE proname = 'create_profile'
    LOOP
        EXECUTE 'DROP FUNCTION ' || r.oid::regprocedure || ' CASCADE';
        RAISE NOTICE 'Eliminada función: %', r.oid::regprocedure;
    END LOOP;
END $$;

-- Paso 2: Crear la nueva función create_profile
CREATE OR REPLACE FUNCTION create_profile(
  user_id uuid,
  user_nombre varchar,
  user_apellido varchar,
  user_dni integer,
  user_telefono varchar
)
RETURNS void AS $$
BEGIN
  -- Insertar perfil con rol Cliente (id_rol = 3) por defecto
  INSERT INTO perfiles (id, nombre, apellido, dni, telefono, id_rol, estado)
  VALUES (
    user_id,
    user_nombre,
    user_apellido,
    user_dni,
    user_telefono,
    3, -- Cliente por defecto
    true -- Activo por defecto
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario de la función
COMMENT ON FUNCTION create_profile IS 'Crea un perfil de usuario con rol Cliente (id_rol=3) por defecto durante el registro';

-- =====================================================
-- Instrucciones de uso:
-- =====================================================
-- 1. Ejecutar este script en el editor SQL de Supabase
-- 2. La función asignará automáticamente el rol Cliente (id_rol=3) a todos los nuevos usuarios
-- 3. Solo los administradores podrán crear usuarios con otros roles desde el panel de administración
-- =====================================================

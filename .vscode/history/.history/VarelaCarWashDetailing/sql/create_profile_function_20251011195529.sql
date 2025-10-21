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

-- Paso 3: Agregar comentario a la función
COMMENT ON FUNCTION create_profile(uuid, varchar, varchar, integer, varchar) IS 'Crea un perfil de usuario con rol Cliente (id_rol=3) por defecto durante el registro';

-- Paso 4: Verificar que la función se creó correctamente
SELECT 
    routine_name,
    routine_type,
    data_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'create_profile';

-- =====================================================
-- Instrucciones de uso:
-- =====================================================
-- 1. Ejecutar este script COMPLETO en el editor SQL de Supabase
-- 2. El script eliminará TODAS las versiones anteriores de create_profile
-- 3. Creará la nueva versión que asigna rol Cliente (id_rol=3) automáticamente
-- 4. Mostrará un SELECT final para confirmar que la función existe
-- 5. Solo los administradores podrán crear usuarios con otros roles desde el panel de administración
-- =====================================================

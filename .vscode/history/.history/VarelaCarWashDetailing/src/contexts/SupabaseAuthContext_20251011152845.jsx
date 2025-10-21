import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    // Cargar perfil, rol y permisos si hay sesión
    if (session?.user) {
      await loadUserData(session.user.id);
    } else {
      setProfile(null);
      setRole(null);
      setPermissions([]);
    }
    
    setLoading(false);
  }, []);

  const loadUserData = useCallback(async (userId) => {
    try {
      // Cargar perfil con información del rol
      const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .select(`
          *,
          roles (
            id_rol,
            nombre,
            descripcion,
            es_sistema
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Error cargando perfil:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        setRole(profileData.roles);
        console.log('✅ Perfil cargado:', profileData);
      }

      // Cargar permisos usando la función de base de datos
      const { data: permissionsData, error: permissionsError } = await supabase
        .rpc('get_user_permissions', { user_id: userId });

      if (permissionsError) {
        console.error('❌ Error cargando permisos:', permissionsError);
      } else {
        setPermissions(permissionsData || []);
        console.log('✅ Permisos cargados:', permissionsData?.length || 0, 'permisos');
      }
    } catch (error) {
      console.error('❌ Error en loadUserData:', error);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, userData, showToast = true) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error && showToast) {
      toast({
        variant: "destructive",
        title: "Fallo el registro",
        description: error.message || "Algo salió mal",
      });
    } else if (!error && showToast) {
      toast({
        title: "¡Registro exitoso!",
        description: "Por favor, revisa tu correo para verificar tu cuenta.",
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Fallo el inicio de sesión",
        description: error.message || "Algo salió mal",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Fallo el cierre de sesión",
        description: error.message || "Algo salió mal",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

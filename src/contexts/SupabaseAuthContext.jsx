import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getSupabaseErrorMessage } from '@/lib/errorTranslations';

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
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        variant: "destructive",
        title: errorMsg.title,
        description: errorMsg.description,
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
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        variant: "destructive",
        title: errorMsg.title,
        description: errorMsg.description,
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        variant: "destructive",
        title: errorMsg.title,
        description: errorMsg.description,
      });
    }

    return { error };
  }, [toast]);

  /**
   * Solicita el restablecimiento de contraseña para un email.
   * Verifica primero si el usuario existe usando una función RPC.
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<{error: Error|null, userExists: boolean}>}
   */
  const resetPassword = useCallback(async (email) => {
    try {
      // Verificar si el usuario existe usando función RPC
      const { data: userExists, error: checkError } = await supabase
        .rpc('check_user_exists_by_email', { user_email: email });

      if (checkError) {
        console.error('Error verificando usuario:', checkError);
        // En caso de error, procedemos de forma segura sin revelar si el usuario existe
        toast({
          title: "Solicitud procesada",
          description: "Si el email está registrado, recibirás un enlace de recuperación.",
        });
        return { error: checkError, userExists: false };
      }

      // Por seguridad, no revelamos si el email existe o no
      // Mostramos el mismo mensaje en ambos casos para evitar enumeration attacks
      if (!userExists) {
        toast({
          title: "Solicitud procesada",
          description: "Si el email está registrado, recibirás un enlace de recuperación.",
        });
        return { error: null, userExists: false };
      }

      // Si el usuario existe, proceder con el reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const errorMsg = getSupabaseErrorMessage(error);
        toast({
          variant: "destructive",
          title: errorMsg.title,
          description: errorMsg.description,
        });
        return { error };
      }

      toast({
        title: "¡Correo enviado!",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });

      return { error: null, userExists: true };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.",
      });
      return { error };
    }
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const errorMsg = getSupabaseErrorMessage(error);
      toast({
        variant: "destructive",
        title: errorMsg.title,
        description: errorMsg.description,
      });
    } else {
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    profile,
    role,
    permissions,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }), [user, session, loading, profile, role, permissions, signUp, signIn, signOut, resetPassword, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

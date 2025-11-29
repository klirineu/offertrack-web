import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError, PostgrestError } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { fetchProfile } from '../services/profileService';
import { withTimeout, isSupabaseClientHealthy } from '../utils/supabaseHelpers';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, extra?: { full_name?: string; phone?: string }) => Promise<{ error: AuthError | PostgrestError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: Error | AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usar withTimeout para prevenir bloqueio indefinido após troca de abas
      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        10000 // 10 segundos de timeout
      );

      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      setIsLoading(false);
    }
  }, []);

  // Configurar listener de mudanças de autenticação
  // IMPORTANTE: Não fazer chamadas ao Supabase dentro deste callback para evitar deadlock
  useEffect(() => {
    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Apenas atualizar o estado do usuário, sem fazer chamadas ao Supabase
      setUser(session?.user ?? null);
      // O profile será buscado pelo useEffect separado que observa mudanças em 'user'
      if (!session?.user) {
        setProfile(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, [initialize]);

  // Buscar profile quando o usuário mudar (separado do onAuthStateChange para evitar deadlock)
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user?.id) {
        if (isMounted) {
          setProfile(null);
        }
        return;
      }

      try {
        const profileData = await fetchProfile(user.id);
        if (isMounted) {
          setProfile(profileData);
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar profile:', err);
        if (isMounted) {
          setProfile(null);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Verificar saúde do cliente Supabase quando a aba recupera foco
  // Isso ajuda a detectar e recuperar de estados corrompidos após troca de abas
  useEffect(() => {
    let isMounted = true;

    async function checkClientHealth() {
      // Verificar apenas se há um usuário logado
      if (!user) return;

      const healthy = await isSupabaseClientHealthy(supabase, 5000);
      if (!healthy && isMounted) {
        console.warn('Cliente Supabase pode estar corrompido. Tentando reinicializar...');
        // Tentar reinicializar a sessão
        try {
          await initialize();
        } catch (err) {
          console.error('Erro ao reinicializar após detecção de cliente corrompido:', err);
        }
      }
    }

    const handleFocus = () => {
      // Verificar saúde quando a aba recupera foco
      checkClientHealth();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, initialize]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        await initialize();
      }
      setIsLoading(false);
      return { error };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsLoading(false);
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, extra?: { full_name?: string; phone?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        setIsLoading(false);
        return { error };
      }

      const profileUpdates: Record<string, unknown> = {};
      if (extra?.full_name) profileUpdates.full_name = extra.full_name;
      if (extra?.phone) profileUpdates.phone = extra.phone;

      let profileError: PostgrestError | null = null;
      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', data.user.id);
        profileError = error;
      }
      setIsLoading(false);
      return { error: error || profileError };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      setIsLoading(false);
      return { error: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setIsLoading(false);
      return { error: null };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setProfile(profile);
  };

  const changePassword = async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setIsLoading(false);
      return { error };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      setIsLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
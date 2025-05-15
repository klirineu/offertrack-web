import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError, PostgrestError } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { fetchProfile } from '../services/profileService';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, extra?: { full_name?: string; plan_id?: string }) => Promise<{ error: AuthError | PostgrestError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
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
      const { data: { session } } = await supabase.auth.getSession();

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

  useEffect(() => {
    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, [initialize]);

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

  const signUp = async (email: string, password: string, extra?: { full_name?: string; plan_id?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        setIsLoading(false);
        return { error };
      }
      const now = new Date();
      const trialExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: extra?.full_name ?? null,
          plan_id: extra?.plan_id ?? null,
          trial_started_at: now.toISOString(),
          trial_expires_at: trialExpires.toISOString(),
          subscription_status: 'trialing',
        })
        .eq('id', data.user.id);
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
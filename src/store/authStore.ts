import { create } from "zustand";
import { User, AuthError, PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    extra?: { full_name?: string; plan_id?: string }
  ) => Promise<{ error: AuthError | PostgrestError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: Error | null }>;
  refreshProfile?: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  return {
    user: null,
    profile: null,
    isLoading: true,
    error: null,

    initialize: async () => {
      try {
        // Check active sessions
        const {
          data: { session },
        } = await supabase.auth.getSession();
        set({ user: session?.user ?? null });

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;
          set({ profile });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          set({ user: session?.user ?? null });

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) throw profileError;
            set({ profile });
          } else {
            set({ profile: null });
          }
        });

        set({ isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize auth",
          isLoading: false,
        });
      }
    },

    signIn: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        set({ isLoading: false });
        return { error };
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to sign in",
          isLoading: false,
        });
        return { error: error as AuthError };
      }
    },

    signUp: async (
      email: string,
      password: string,
      extra?: { full_name?: string; plan_id?: string }
    ) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error || !data.user) {
          set({ isLoading: false });
          return { error };
        }
        // Salvar dados extras no perfil
        const now = new Date();
        const trialExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: extra?.full_name ?? null,
            plan_id: extra?.plan_id ?? null,
            trial_started_at: now.toISOString(),
            trial_expires_at: trialExpires.toISOString(),
            subscription_status: "trialing",
          })
          .eq("id", data.user.id);
        set({ isLoading: false });
        return { error: error || profileError };
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to sign up",
          isLoading: false,
        });
        return { error: error as AuthError };
      }
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      try {
        await supabase.auth.signOut();
        set({ user: null, profile: null, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to sign out",
          isLoading: false,
        });
      }
    },

    updateProfile: async (updates: Partial<Profile>) => {
      const { user } = get();
      if (!user) return { error: new Error("No user logged in") };

      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) throw error;

        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
          isLoading: false,
        }));

        return { error: null };
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to update profile",
          isLoading: false,
        });
        return { error: error as Error };
      }
    },

    refreshProfile: async () => {
      const { user } = get();
      if (!user) return;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error) set({ profile });
    },
  };
});

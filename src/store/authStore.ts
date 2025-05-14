import { create } from "zustand";
import { User, AuthError } from "@supabase/supabase-js";
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
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: Error | null }>;
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

    signUp: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        set({ isLoading: false });
        return { error };
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
  };
});

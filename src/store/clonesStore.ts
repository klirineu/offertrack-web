import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

export interface CloneSite {
  id: string;
  url: string;
}

interface ClonesStore {
  clones: CloneSite[];
  isLoading: boolean;
  error: string | null;
  fetchClones: () => Promise<void>;
  setClones: (clones: CloneSite[]) => void;
  addClone: (url: string) => Promise<void>;
  removeClone: (id: string) => Promise<void>;
  getClone: (id: string) => CloneSite | undefined;
}

export const useClonesStore = create<ClonesStore>((set, get) => ({
  clones: [],
  isLoading: false,
  error: null,

  fetchClones: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("cloned_sites")
        .select("id, url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ clones: data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch clones",
        isLoading: false,
      });
    }
  },

  setClones: (clones) => set({ clones }),

  addClone: async (url) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("cloned_sites")
        .insert({ user_id: user.id, url })
        .select("id, url")
        .single();
      if (error) throw error;
      set((state) => ({
        clones: data ? [data, ...state.clones] : state.clones,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add clone",
        isLoading: false,
      });
    }
  },

  removeClone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("cloned_sites")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      set((state) => ({
        clones: state.clones.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete clone",
        isLoading: false,
      });
    }
  },

  getClone: (id) => get().clones.find((c) => c.id === id),
}));

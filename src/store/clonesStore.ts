import { create } from "zustand";
import { supabase } from "../lib/supabase";
import api from "../services/api";

export interface CloneSite {
  id: string;
  url: string;
  original_url?: string;
}

interface ClonesStore {
  clones: CloneSite[];
  isLoading: boolean;
  error: string | null;
  fetchClones: () => Promise<void>;
  setClones: (clones: CloneSite[]) => void;
  addClone: (originalUrl: string, clonedUrl: string) => Promise<void>;
  removeClone: (id: string, urlId: string) => Promise<void>;
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
        .select("id, url, original_url")
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

  addClone: async (originalUrl, clonedUrl) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_id")
        .eq("id", user.id)
        .single();
      if (!profile || !profile.plan_id)
        throw new Error("Plano não encontrado.");
      // Buscar limites do plano
      const { data: plan } = await supabase
        .from("plans")
        .select("max_clones")
        .eq("id", profile.plan_id)
        .single();
      if (!plan) throw new Error("Limite do plano não encontrado.");
      // Contar clones existentes
      const { count } = await supabase
        .from("cloned_sites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (typeof count === "number" && count >= plan.max_clones) {
        set({
          isLoading: false,
          error: `Limite de páginas clonadas atingido para seu plano. (${plan.max_clones})`,
        });
        throw new Error(
          `Limite de páginas clonadas atingido para seu plano. (${plan.max_clones})`
        );
      }

      const { data, error } = await supabase
        .from("cloned_sites")
        .insert({ user_id: user.id, original_url: originalUrl, url: clonedUrl })
        .select("id, url, original_url")
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

  removeClone: async (id, urlId) => {
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

      // Chamada à API para remover arquivos/recursos do clone

      await api.delete("/api/clone", { data: { subdomain: urlId } });

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

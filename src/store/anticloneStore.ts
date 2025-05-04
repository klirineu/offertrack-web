import { create } from "zustand";
import { supabase } from "../lib/supabase";

type AnticloneSite = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  original_url: string;
  original_host: string;
  action_type: AnticloneActionType;
  action_data: string;
};
type NewAnticloneSite = Omit<
  AnticloneSite,
  "id" | "created_at" | "updated_at" | "user_id"
>;

export type AnticloneActionType =
  | "redirect"
  | "replace_links"
  | "replace_images";

interface UpdateSiteParams {
  action_type: AnticloneActionType;
  action_data: string;
}

interface AnticloneStore {
  sites: AnticloneSite[];
  isLoading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  addSite: (site: NewAnticloneSite) => Promise<AnticloneSite | null>;
  updateSite: (id: string, params: UpdateSiteParams) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
}

export const useAnticloneStore = create<AnticloneStore>((set) => ({
  sites: [],
  isLoading: false,
  error: null,

  fetchSites: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: sites, error } = await supabase
        .from("anticlone_sites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ sites, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch sites",
        isLoading: false,
      });
    }
  },

  addSite: async (site) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Extract hostname from URL
      const url = new URL(site.original_url);
      const siteWithHost = {
        ...site,
        original_host: url.hostname,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("anticlone_sites")
        .insert(siteWithHost)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        sites: [data, ...state.sites],
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add site",
        isLoading: false,
      });
      return null;
    }
  },

  updateSite: async (id, params) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("anticlone_sites")
        .update({
          ...params,
          user_id: user.id,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();

      if (error) throw error;

      set((state) => ({
        sites: state.sites.map((site) =>
          site.id === id
            ? { ...site, ...params, ...(data && data[0] ? data[0] : {}) }
            : site
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update site",
        isLoading: false,
      });
    }
  },

  deleteSite: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("anticlone_sites")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      set((state) => ({
        sites: state.sites.filter((site) => site.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete site",
        isLoading: false,
      });
    }
  },
}));

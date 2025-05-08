// stores/offerStore.ts
import { create } from "zustand";
import { Offer, AdMetrics } from "../types";
import { supabase } from "../lib/supabase";
import { Database, Json } from "../types/supabase";

type SupabaseOffer = Database["public"]["Tables"]["offers"]["Row"];

const mapSupabaseOffer = (offer: SupabaseOffer): Offer => ({
  id: offer.id,
  title: offer.title,
  offerUrl: offer.offer_url,
  landingPageUrl: offer.landing_page_url,
  description: offer.description || undefined,
  tags: offer.tags,
  status: offer.status,
  createdAt: new Date(offer.created_at),
  updatedAt: new Date(offer.updated_at),
  metrics: (offer.metrics as unknown as AdMetrics[]) || [],
});

const mapToSupabaseOffer = (offer: Partial<Offer>) => ({
  title: offer.title,
  offer_url: offer.offerUrl,
  landing_page_url: offer.landingPageUrl,
  description: offer.description,
  tags: offer.tags,
  status: offer.status,
  metrics: offer.metrics as unknown as Json[],
});

interface OfferStore {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  setOffers: (offers: Offer[]) => void;
  updateOffer: (offerId: string, updates: Partial<Offer>) => Promise<void>;
  addOffer: (
    newOffer: Omit<Offer, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  deleteOffer: (offerId: string) => Promise<void>;
}

export const useOfferStore = create<OfferStore>((set) => ({
  offers: [],
  isLoading: false,
  error: null,

  fetchOffers: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data: offers, error } = await supabase
        .from("offers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({
        offers: offers.map(mapSupabaseOffer),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch offers",
        isLoading: false,
      });
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  setOffers: (newOffers) => set({ offers: newOffers }),

  updateOffer: async (offerId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("offers")
        .update(mapToSupabaseOffer(updates))
        .eq("id", offerId);
      if (error) throw error;
      set((state) => ({
        offers: state.offers.map((offer) =>
          offer.id === offerId
            ? {
                ...offer,
                ...updates,
                updatedAt: new Date(),
              }
            : offer
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update offer",
        isLoading: false,
      });
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  addOffer: async (newOffer: Omit<Offer, "id" | "createdAt" | "updatedAt">) => {
    set({ isLoading: true, error: null });
    let insertResult;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("[DEBUG] addOffer - User not authenticated");
        throw new Error("User not authenticated");
      }
      const insertObj = {
        ...mapToSupabaseOffer(newOffer),
        user_id: user.id,
      };

      try {
        insertResult = await supabase
          .from("offers")
          .insert(insertObj)
          .select()
          .single();
      } catch (err) {
        console.error(
          "[DEBUG] addOffer - insert promise error:",
          err,
          "insertObj:",
          insertObj
        );
        throw new Error(
          "Supabase insert promise failed: " +
            (err instanceof Error ? err.message : String(err))
        );
      }

      if (!insertResult) {
        console.error(
          "[DEBUG] addOffer - insertResult is undefined! insertObj:",
          insertObj
        );
        throw new Error(
          "Supabase insertResult is undefined. Veja o insertObj e o schema da tabela."
        );
      }
      const data = insertResult.data;
      const error = insertResult.error;
      if (error) {
        console.error("[DEBUG] addOffer - insert error:", error);
        throw error;
      }
      set((state) => ({
        offers: data ? [mapSupabaseOffer(data), ...state.offers] : state.offers,
        isLoading: false,
      }));
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  deleteOffer: async (offerId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
      if (error) throw error;
      set((state) => ({
        offers: state.offers.filter((offer) => offer.id !== offerId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete offer",
        isLoading: false,
      });
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },
}));

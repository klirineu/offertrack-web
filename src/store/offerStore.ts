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
    }
  },

  addOffer: async (newOffer) => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const insertObj = {
        ...mapToSupabaseOffer(newOffer),
        user_id: user.id,
      };
      console.log("[DEBUG] addOffer insertObj", insertObj);
      const { data, error } = await supabase
        .from("offers")
        .insert(insertObj)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        offers: [mapSupabaseOffer(data), ...state.offers],
        isLoading: false,
      }));
    } catch (error) {
      console.error("[DEBUG] addOffer error", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add offer",
        isLoading: false,
      });
    }
  },

  deleteOffer: async (offerId) => {
    console.log("Deleting offerrrr:", offerId);
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
    }
  },
}));

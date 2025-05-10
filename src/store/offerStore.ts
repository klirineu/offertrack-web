// stores/offerStore.ts
import { create } from "zustand";
import { Offer, AdMetrics } from "../types";
import {
  fetchOffersService,
  addOfferService,
  updateOfferService,
  deleteOfferService,
} from "../services/offerService";
import { Database } from "../types/supabase";

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
  metrics: offer.metrics,
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
      const { data, error } = await fetchOffersService();
      if (error) throw error;
      set({
        offers: data ? data.map(mapSupabaseOffer) : [],
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
      const { error } = await updateOfferService(
        offerId,
        mapToSupabaseOffer(updates)
      );
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
    try {
      const insertObj = {
        ...mapToSupabaseOffer(newOffer),
      };
      const { data, error } = await addOfferService(insertObj);

      if (error || !data) {
        console.error(
          "[DEBUG] addOffer - Supabase error ou dados ausentes:",
          error,
          data
        );
        const errorMsg =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error && "message" in error
            ? (error as any).message
            : "No data returned from Supabase";
        throw new Error(errorMsg);
      }
      if (typeof data !== "object" || data === null) {
        throw new Error("Dados inválidos retornados do Supabase");
      }
    } catch (error) {
      console.error("[DEBUG] addOffer - catch error:", error);
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
      throw error; // Propaga o erro para o dialog
    }
  },

  deleteOffer: async (offerId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await deleteOfferService(offerId);
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

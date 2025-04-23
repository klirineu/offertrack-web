// stores/offerStore.ts
import { create } from "zustand";
import { Offer } from "../types";

interface OfferStore {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  updateOffer: (offerId: string, updates: Partial<Offer>) => void;
  addOffer: (newOffer: Offer) => void; // Nova função
}

export const useOfferStore = create<OfferStore>((set) => ({
  offers: [],
  setOffers: (newOffers) => set({ offers: newOffers }),
  updateOffer: (offerId, updates) =>
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === offerId ? { ...offer, ...updates } : offer
      ),
    })),
  addOffer: (newOffer) =>
    set((state) => ({
      offers: [...state.offers, newOffer],
    })),
}));

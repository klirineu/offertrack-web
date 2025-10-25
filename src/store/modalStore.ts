import { create } from "zustand";

interface ModalStore {
  isNewOfferDialogOpen: boolean;
  setIsNewOfferDialogOpen: (open: boolean) => void;

  isEditOfferDialogOpen: boolean;
  setIsEditOfferDialogOpen: (open: boolean) => void;

  selectedOfferId: string | null;
  setSelectedOfferId: (id: string | null) => void;

  offers: any[];
  setOffers: (offers: any[]) => void;

  onOfferUpdated: ((offer: any) => void) | null;
  setOnOfferUpdated: (callback: ((offer: any) => void) | null) => void;

  onNewOffer: ((offer: any) => Promise<void>) | null;
  setOnNewOffer: (callback: ((offer: any) => Promise<void>) | null) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isNewOfferDialogOpen: false,
  setIsNewOfferDialogOpen: (open) => set({ isNewOfferDialogOpen: open }),

  isEditOfferDialogOpen: false,
  setIsEditOfferDialogOpen: (open) => set({ isEditOfferDialogOpen: open }),

  selectedOfferId: null,
  setSelectedOfferId: (id) => set({ selectedOfferId: id }),

  offers: [],
  setOffers: (offers) => set({ offers }),

  onOfferUpdated: null,
  setOnOfferUpdated: (callback) => set({ onOfferUpdated: callback }),

  onNewOffer: null,
  setOnNewOffer: (callback) => set({ onNewOffer: callback }),
}));

// stores/editDialogStore.ts
import { create } from "zustand";

interface EditDialogState {
  selectedOfferId: string | null;
  openDialog: (offerId: string) => void;
  closeDialog: () => void;
}

export const useEditDialogStore = create<EditDialogState>((set) => ({
  selectedOfferId: null,
  openDialog: (offerId) => {
    console.log(offerId);
    set({ selectedOfferId: offerId });
  },
  closeDialog: () => set({ selectedOfferId: null }),
}));

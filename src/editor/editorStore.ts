import { create } from "zustand";

interface EditorState {
  selectedElement: string | null;
  setSelectedElement: (selector: string | null) => void;
  selectedOtId: string | null;
  setSelectedOtId: (id: string | null) => void;
  customCss: string;
  setCustomCss: (css: string) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  selectedElement: null,
  setSelectedElement: (selector) => set({ selectedElement: selector }),
  selectedOtId: null,
  setSelectedOtId: (id) => set({ selectedOtId: id }),
  customCss: "",
  setCustomCss: (css) => set({ customCss: css }),
}));

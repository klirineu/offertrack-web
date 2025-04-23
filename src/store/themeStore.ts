// store/themeStore.ts
import { create } from "zustand";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  // Inicializar com o tema do localStorage ou do sistema
  const initialTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  // Aplicar o tema inicial no HTML
  document.documentElement.classList.toggle("dark", initialTheme === "dark");

  return {
    theme: initialTheme as "light" | "dark",
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        return { theme: newTheme };
      }),
  };
});

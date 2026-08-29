import { create } from "zustand";

/**
 * Hauteur réelle de l'en-tête (bandeau d'annonce compris), mesurée par
 * `Header`. Le Hero de l'accueil s'en sert pour occuper exactement le reste
 * de l'écran (en-tête + Hero = 100vh) sans coder en dur une hauteur de
 * navbar qui varie selon le bandeau d'annonce et la taille du logo.
 */
type LayoutState = {
  headerHeight: number;
  setHeaderHeight: (px: number) => void;
};

export const useLayoutStore = create<LayoutState>()((set) => ({
  headerHeight: 0,
  setHeaderHeight: (px) => set({ headerHeight: px }),
}));

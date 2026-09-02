import { create } from "zustand";

/**
 * Hauteur réelle de l'en-tête (bandeau d'annonce compris), mesurée par
 * `Header`. Le bloc d'accueil s'en sert pour se dimensionner par rapport à ce
 * qui reste de l'écran sous l'en-tête, sans coder en dur une hauteur de navbar
 * qui varie selon le bandeau d'annonce et la taille du logo.
 */
type LayoutState = {
  headerHeight: number;
  setHeaderHeight: (px: number) => void;
};

export const useLayoutStore = create<LayoutState>()((set) => ({
  headerHeight: 0,
  setHeaderHeight: (px) => set({ headerHeight: px }),
}));

import { create } from "zustand";

export type User = { id: string; name: string; phone: string; email?: string; role: "CLIENT" | "ADMIN" };

/**
 * État de la session.
 *
 * `loading` existe parce que, au chargement de la page, on ne SAIT pas encore
 * si la visiteuse est connectée : il faut d'abord demander au serveur de
 * renouveler la session à partir du cookie. Sans cet état, l'application
 * afficherait une fraction de seconde « non connectée » à quelqu'un qui l'est,
 * et redirigerait à tort hors du back-office.
 */
export type SessionStatus = "loading" | "authenticated" | "anonymous";

type AuthState = {
  user: User | null;
  /**
   * Jeton d'accès gardé EN MÉMOIRE seulement.
   *
   * Il n'est volontairement pas écrit dans localStorage : tout script injecté
   * dans la page pourrait l'y lire (XSS). La session survit malgré tout au
   * rechargement, parce que le serveur la reconstruit depuis un cookie
   * HttpOnly que le JavaScript, lui, ne peut pas lire.
   */
  accessToken: string | null;
  status: SessionStatus;
  authOpen: boolean;
  setSession: (session: { user: User; accessToken: string }) => void;
  setStatus: (status: SessionStatus) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  authOpen: false,
  setSession: ({ user, accessToken }) => set({ user, accessToken, status: "authenticated", authOpen: false }),
  setStatus: (status) => set({ status }),
  logout: () => set({ user: null, accessToken: null, status: "anonymous" }),
  setAuthOpen: (authOpen) => set({ authOpen }),
}));

/** Raccourci lisible : la personne connectée gère-t-elle la boutique ? */
export const selectIsAdmin = (state: AuthState) => state.user?.role === "ADMIN";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = { id: string; name: string; phone: string; email?: string; role: "CLIENT" | "ADMIN" };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  authOpen: boolean;
  setSession: (session: { user: User; accessToken: string }) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      authOpen: false,
      setSession: ({ user, accessToken }) => set({ user, accessToken, authOpen: false }),
      logout: () => set({ user: null, accessToken: null }),
      setAuthOpen: (authOpen) => set({ authOpen }),
    }),
    { name: "mw-auth", partialize: (state) => ({ user: state.user, accessToken: state.accessToken }) },
  ),
);

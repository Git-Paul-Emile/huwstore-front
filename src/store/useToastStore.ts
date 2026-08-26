import { create } from "zustand";

export type Toast = { id: number; msg: string };

type ToastState = {
  toasts: Toast[];
  toast: (msg: string) => void;
};

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  toast: (msg) => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, msg }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 3000);
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type { Product, Zone } from "../data";

export type CartLine = { product: Product; qty: number };
export type DeliveryMethod = "home" | "relay";

type CartState = {
  cart: CartLine[];
  wishlist: string[];
  zone: Zone | null;
  delivery: DeliveryMethod;
  cartOpen: boolean;
  addToCart: (product: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  setCartOpen: (open: boolean) => void;
  toggleWish: (id: string) => void;
  setZone: (zone: Zone) => void;
  setDelivery: (method: DeliveryMethod) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      zone: null,
      delivery: "home",
      cartOpen: false,

      addToCart: (product, qty = 1) =>
        set((state) => {
          const found = state.cart.find((l) => l.product.id === product.id);
          const cart = found
            ? state.cart.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + qty } : l))
            : [...state.cart, { product, qty }];
          return { cart, cartOpen: true };
        }),

      setQty: (id, qty) =>
        set((state) => ({ cart: state.cart.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, qty) } : l)) })),

      remove: (id) => set((state) => ({ cart: state.cart.filter((l) => l.product.id !== id) })),

      setCartOpen: (cartOpen) => set({ cartOpen }),

      toggleWish: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id) ? state.wishlist.filter((x) => x !== id) : [...state.wishlist, id],
        })),

      setZone: (zone) => set({ zone }),
      setDelivery: (delivery) => set({ delivery }),
    }),
    {
      name: "mw-cart",
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, zone: state.zone, delivery: state.delivery }),
    },
  ),
);

// Retrait en point relais/boutique = gratuit ; livraison offerte au-delà du seuil de la zone.
export function useCartTotals() {
  const cart = useCartStore((s) => s.cart);
  const zone = useCartStore((s) => s.zone);
  const delivery = useCartStore((s) => s.delivery);

  return useMemo(() => {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((n, l) => n + l.qty * l.product.price, 0);
    const shipping = !zone || delivery === "relay" || subtotal >= zone.freeFrom || subtotal === 0 ? 0 : zone.fee;
    return { count, subtotal, shipping };
  }, [cart, zone, delivery]);
}

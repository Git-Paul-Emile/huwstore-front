import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type { Product, ProductVariant, Zone } from "../data";

/**
 * Une ligne de panier porte le produit ET la déclinaison choisie : on
 * n'achète pas « un tote bag » mais « un tote bag noir ». La clé de ligne est
 * donc l'identifiant de variante — deux coloris du même modèle sont deux
 * lignes distinctes, comme dans n'importe quelle boutique.
 */
export type CartLine = { product: Product; variant: ProductVariant; qty: number };
export type DeliveryMethod = "home" | "relay";

type CartState = {
  cart: CartLine[];
  wishlist: string[];
  zone: Zone | null;
  delivery: DeliveryMethod;
  cartOpen: boolean;
  addToCart: (product: Product, variant: ProductVariant, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCartOpen: (open: boolean) => void;
  toggleWish: (productId: string) => void;
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

      addToCart: (product, variant, qty = 1) =>
        set((state) => {
          const existing = state.cart.find((line) => line.variant.id === variant.id);
          const cart = existing
            ? state.cart.map((line) =>
                line.variant.id === variant.id
                  ? // On ne dépasse jamais le stock disponible de cette couleur.
                    { ...line, qty: Math.min(line.qty + qty, variant.stock.qty || line.qty + qty) }
                  : line,
              )
            : [...state.cart, { product, variant, qty }];
          return { cart, cartOpen: true };
        }),

      setQty: (variantId, qty) =>
        set((state) => ({
          cart: state.cart.map((line) => (line.variant.id === variantId ? { ...line, qty: Math.max(1, qty) } : line)),
        })),

      remove: (variantId) => set((state) => ({ cart: state.cart.filter((line) => line.variant.id !== variantId) })),

      clear: () => set({ cart: [] }),

      setCartOpen: (cartOpen) => set({ cartOpen }),

      toggleWish: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      setZone: (zone) => set({ zone }),
      setDelivery: (delivery) => set({ delivery }),
    }),
    {
      // Version incrémentée : l'ancien panier (sans déclinaison) n'est plus
      // lisible, on le vide plutôt que de laisser planter l'affichage.
      name: "mw-cart",
      version: 2,
      migrate: (persisted, version) =>
        version < 2
          ? { ...(persisted as object), cart: [] }
          : (persisted as { cart: CartLine[]; wishlist: string[]; zone: Zone | null; delivery: DeliveryMethod }),
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, zone: state.zone, delivery: state.delivery }),
    },
  ),
);

/** Retrait en point relais/boutique = gratuit ; livraison offerte au-delà du seuil de la zone. */
export function useCartTotals() {
  const cart = useCartStore((s) => s.cart);
  const zone = useCartStore((s) => s.zone);
  const delivery = useCartStore((s) => s.delivery);

  return useMemo(() => {
    const count = cart.reduce((n, line) => n + line.qty, 0);
    const subtotal = cart.reduce((n, line) => n + line.qty * line.product.price, 0);
    const shipping = !zone || delivery === "relay" || subtotal >= zone.freeFrom || subtotal === 0 ? 0 : zone.fee;
    return { count, subtotal, shipping };
  }, [cart, zone, delivery]);
}

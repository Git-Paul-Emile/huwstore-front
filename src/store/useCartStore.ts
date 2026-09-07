import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type { Product, ProductVariant, Zone } from "../data";

/**
 * Une ligne de panier porte le produit ET la déclinaison choisie : on
 * n'achète pas « un tote bag » mais « un tote bag noir ». La clé de ligne est
 * donc l'identifiant de variante - deux coloris du même modèle sont deux
 * lignes distinctes, comme dans n'importe quelle boutique.
 */
export type CartLine = { product: Product; variant: ProductVariant; qty: number };

type CartState = {
  cart: CartLine[];
  wishlist: string[];
  /**
   * Produit qu'une visiteuse non connectée vient de vouloir mettre en favori :
   * ajouter un favori exige désormais un compte, donc on mémorise son intention
   * le temps qu'elle se connecte (ou en crée un), pour la compléter ensuite
   * sans lui faire recliquer sur le cœur.
   */
  pendingWishlist: string | null;
  zone: Zone | null;
  cartOpen: boolean;
  addToCart: (product: Product, variant: ProductVariant, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCartOpen: (open: boolean) => void;
  toggleWish: (productId: string) => void;
  /** Vidée une fois la liste locale versée dans le compte du client. */
  clearWishlist: () => void;
  setPendingWishlist: (productId: string | null) => void;
  setZone: (zone: Zone) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      pendingWishlist: null,
      zone: null,
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

      clearWishlist: () => set({ wishlist: [] }),

      setPendingWishlist: (pendingWishlist) => set({ pendingWishlist }),

      setZone: (zone) => set({ zone }),
    }),
    {
      // v2 : l'ancien panier (sans déclinaison) n'est plus lisible, on le vide.
      // v3 : le champ `delivery` (domicile / point relais) a disparu, le retrait
      // en point relais n'est plus proposé.
      name: "mw-cart",
      version: 3,
      migrate: (persisted, version) => {
        if (version < 2) return { ...(persisted as object), cart: [] };
        const { cart, wishlist, zone } = persisted as { cart: CartLine[]; wishlist: string[]; zone: Zone | null };
        return { cart, wishlist, zone };
      },
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, zone: state.zone }),
    },
  ),
);

/** Livraison offerte au-delà du seuil de la zone (ou panier vide). */
export function useCartTotals() {
  const cart = useCartStore((s) => s.cart);
  const zone = useCartStore((s) => s.zone);

  return useMemo(() => {
    const count = cart.reduce((n, line) => n + line.qty, 0);
    const subtotal = cart.reduce((n, line) => n + line.qty * line.product.price, 0);
    const shipping = !zone || subtotal >= zone.freeFrom || subtotal === 0 ? 0 : zone.fee;
    return { count, subtotal, shipping };
  }, [cart, zone]);
}

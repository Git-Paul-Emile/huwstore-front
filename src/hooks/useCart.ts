import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCartRemote,
  clearCartRemote,
  getCart,
  mergeCart,
  removeFromCartRemote,
  setCartQtyRemote,
} from "../api/cart";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore, type CartLine } from "../store/useCartStore";
import { useToastStore } from "../store/useToastStore";
import type { Product, ProductVariant } from "../data";

const KEY = ["cart"];

/**
 * Panier : réservé au compte une fois connectée, sur le même principe que
 * les favoris (`useWishlist`). Une visiteuse non connectée garde un panier
 * local (store `useCartStore`) ; `useCartSync` le verse dans le compte à la
 * connexion. La commande exigeant déjà un compte (`RequireAuth` sur
 * `/commande`), le panier n'a jamais besoin d'exister « seulement en local »
 * au moment de payer.
 */
export function useCart() {
  const isLogged = useAuthStore((s) => Boolean(s.accessToken));
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.toast);

  const localCart = useCartStore((s) => s.cart);
  const localAdd = useCartStore((s) => s.addToCart);
  const localSetQty = useCartStore((s) => s.setQty);
  const localRemove = useCartStore((s) => s.remove);
  const localClear = useCartStore((s) => s.clear);

  const { data: remoteCart = [] } = useQuery({ queryKey: KEY, queryFn: getCart, enabled: isLogged });

  const add = useMutation({
    mutationFn: ({ variant, qty }: { product: Product; variant: ProductVariant; qty: number }) =>
      addToCartRemote(variant.id, qty),

    // Ajout optimiste : le panier affiché change tout de suite, sans attendre
    // la réponse serveur. La cliente qui clique « Ajouter au panier » ne doit
    // jamais sentir un aller-retour réseau.
    onMutate: async ({ product, variant, qty }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<CartLine[]>(KEY) ?? [];
      const existing = previous.find((line) => line.variant.id === variant.id);
      const optimistic = existing
        ? previous.map((line) => (line.variant.id === variant.id ? { ...line, qty: line.qty + qty } : line))
        : [...previous, { product, variant, qty }];
      queryClient.setQueryData(KEY, optimistic);
      return { previous };
    },
    // Le serveur a refusé ou n'a pas répondu : on annule l'ajout optimiste
    // plutôt que de laisser croire à un article qui n'est pas vraiment au panier.
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(KEY, context.previous);
    },
    onSuccess: (lines) => queryClient.setQueryData(KEY, lines),
  });
  const changeQty = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) => setCartQtyRemote(variantId, qty),
    onSuccess: (lines) => queryClient.setQueryData(KEY, lines),
  });
  const drop = useMutation({
    mutationFn: (variantId: string) => removeFromCartRemote(variantId),
    onSuccess: (lines) => queryClient.setQueryData(KEY, lines),
  });
  const empty = useMutation({
    mutationFn: clearCartRemote,
    onSuccess: () => queryClient.setQueryData(KEY, []),
  });

  return {
    cart: isLogged ? remoteCart : localCart,

    addToCart: (product: Product, variant: ProductVariant, qty = 1) => {
      if (isLogged) add.mutate({ product, variant, qty });
      else localAdd(product, variant, qty);
      toast("Ajouté au panier");
    },

    setQty: (variantId: string, qty: number) => {
      const bounded = Math.max(1, qty);
      if (isLogged) changeQty.mutate({ variantId, qty: bounded });
      else localSetQty(variantId, bounded);
    },

    remove: (variantId: string) => {
      if (isLogged) drop.mutate(variantId);
      else localRemove(variantId);
    },

    clear: () => {
      if (isLogged) empty.mutate();
      else localClear();
    },
  };
}

/** À monter une seule fois, dans la mise en page principale. */
export function useCartSync() {
  const isLogged = useAuthStore((s) => Boolean(s.accessToken));
  const local = useCartStore((s) => s.cart);
  const clearLocal = useCartStore((s) => s.clear);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLogged || local.length === 0) return;
    mergeCart(local.map((line) => ({ variantId: line.variant.id, qty: line.qty })))
      .then((lines) => {
        queryClient.setQueryData(KEY, lines);
        clearLocal();
      })
      .catch(() => {
        // Sans réseau, le panier local reste en place : la fusion sera
        // retentée au prochain rendu où la cliente est connectée.
      });
  }, [isLogged, local, clearLocal, queryClient]);
}

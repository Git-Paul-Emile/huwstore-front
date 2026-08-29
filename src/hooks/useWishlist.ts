import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWishlist, getWishlist, mergeWishlist, removeFromWishlist } from "../api/wishlist";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";

const KEY = ["wishlist"];

/**
 * Favoris : réservés aux clientes connectées.
 *
 * Mettre un produit en favori sans compte ouvre la connexion plutôt que de
 * l'enregistrer localement - `pendingWishlist` retient l'intention le temps
 * de se connecter, et `useWishlistSync` la complète une fois la session ouverte.
 *
 * `wishlist`/`toggleWish` côté store restent lus ici par compatibilité avec
 * d'anciennes listes locales déjà enregistrées dans le navigateur avant ce
 * changement ; elles sont versées dans le compte à la connexion puis vidées.
 */
export function useWishlist() {
  const isLogged = useAuthStore((s) => Boolean(s.accessToken));
  const setAuthOpen = useAuthStore((s) => s.setAuthOpen);
  const local = useCartStore((s) => s.wishlist);
  const setPendingWishlist = useCartStore((s) => s.setPendingWishlist);
  const queryClient = useQueryClient();

  const { data: remote = [] } = useQuery({ queryKey: KEY, queryFn: getWishlist, enabled: isLogged });

  const add = useMutation({
    mutationFn: addToWishlist,
    onSuccess: (ids) => queryClient.setQueryData(KEY, ids),
  });
  const remove = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (ids) => queryClient.setQueryData(KEY, ids),
  });

  const ids = isLogged ? remote : local;

  return {
    ids,
    has: (productId: string) => ids.includes(productId),
    toggle: (productId: string) => {
      if (!isLogged) {
        setPendingWishlist(productId);
        setAuthOpen(true);
        return;
      }
      if (ids.includes(productId)) remove.mutate(productId);
      else add.mutate(productId);
    },
  };
}

/** À monter une seule fois, dans la mise en page principale. */
export function useWishlistSync() {
  const isLogged = useAuthStore((s) => Boolean(s.accessToken));
  const local = useCartStore((s) => s.wishlist);
  const clearLocal = useCartStore((s) => s.clearWishlist);
  const pending = useCartStore((s) => s.pendingWishlist);
  const setPendingWishlist = useCartStore((s) => s.setPendingWishlist);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLogged || local.length === 0) return;
    mergeWishlist(local)
      .then((ids) => {
        queryClient.setQueryData(KEY, ids);
        clearLocal();
      })
      .catch(() => {
        // Sans réseau, la liste locale reste en place : la fusion sera retentée
        // au prochain rendu où l'utilisateur est connecté.
      });
  }, [isLogged, local, clearLocal, queryClient]);

  // Le cœur cliqué juste avant la connexion (qui a ouvert le formulaire) est
  // complété dès que la session s'ouvre, sans que la cliente ait à recliquer.
  useEffect(() => {
    if (!isLogged || !pending) return;
    addToWishlist(pending)
      .then((ids) => {
        queryClient.setQueryData(KEY, ids);
        setPendingWishlist(null);
      })
      .catch(() => {
        // Sans réseau, l'intention reste en mémoire : retentée au prochain rendu.
      });
  }, [isLogged, pending, queryClient, setPendingWishlist]);
}

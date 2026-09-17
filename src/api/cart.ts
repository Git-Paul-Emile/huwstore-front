import { api, unwrap } from "./axiosConfig";
import type { CartLine } from "../store/useCartStore";

export const getCart = () => unwrap<CartLine[]>(api.get("/cart"));

export const addToCartRemote = (variantId: string, qty: number) =>
  unwrap<CartLine[]>(api.post("/cart", { variantId, qty }));

export const setCartQtyRemote = (variantId: string, qty: number) =>
  unwrap<CartLine[]>(api.patch(`/cart/${variantId}`, { qty }));

export const removeFromCartRemote = (variantId: string) => unwrap<CartLine[]>(api.delete(`/cart/${variantId}`));

/** Verse le panier local d'une visiteuse dans son compte, au moment où elle se connecte. */
export const mergeCart = (lines: { variantId: string; qty: number }[]) =>
  unwrap<CartLine[]>(api.post("/cart/merge", { lines }));

/** Vidage complet, appelé une fois la commande enregistrée. */
export const clearCartRemote = (): Promise<void> => api.delete("/cart").then(() => undefined);

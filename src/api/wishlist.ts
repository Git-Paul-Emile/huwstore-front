import { api, unwrap } from "./axiosConfig";

/** L'API renvoie toujours la liste complète des identifiants après chaque écriture. */
export const getWishlist = () => unwrap<string[]>(api.get("/wishlist"));

export const addToWishlist = (productId: string) => unwrap<string[]>(api.post(`/wishlist/${productId}`));

export const removeFromWishlist = (productId: string) => unwrap<string[]>(api.delete(`/wishlist/${productId}`));

/** Verse la liste locale d'un visiteur dans son compte, au moment où il se connecte. */
export const mergeWishlist = (productIds: string[]) => unwrap<string[]>(api.post("/wishlist/merge", { productIds }));

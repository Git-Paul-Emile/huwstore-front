import { api, unwrap } from "./axiosConfig";

/** Le stock se lit et se pilote à la déclinaison couleur, pas au produit. */
export type StockLevel = {
  variantId: string;
  sku: string;
  productId: string;
  product: string;
  color: string;
  qty: number;
  threshold: number;
  low: boolean;
};

export type StockMoveType = "Entrée" | "Sortie" | "Ajustement" | "Vente";

export type StockMovement = {
  id: string;
  variantId: string;
  product: string;
  color: string;
  type: StockMoveType;
  qty: number;
  reason: string;
  author: string;
  date: string;
};

export type StockAdjustInput = {
  variantId: string;
  type: StockMoveType;
  qty: number;
  reason: string;
  author: string;
};

export const getStock = () => unwrap<StockLevel[]>(api.get("/stock"));

export const getStockMovements = () => unwrap<StockMovement[]>(api.get("/stock/movements"));

export const adjustStock = (input: StockAdjustInput) =>
  unwrap<StockMovement & { newQty: number }>(api.post("/stock/adjust", input));

/** Inventaire exportable, au format attendu par Excel en français. */
export const exportStockCsv = () =>
  api.get("/stock/export", { responseType: "blob" }).then((res) => res.data as Blob);

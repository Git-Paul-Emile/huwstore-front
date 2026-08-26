import { api, unwrap } from "./axiosConfig";

export type StockLevel = { productId: string; product: string; qty: number; threshold: number };
export type StockMoveType = "Entrée" | "Sortie" | "Ajustement" | "Vente";
export type StockMovement = { id: string; product: string; type: StockMoveType; qty: number; reason: string; author: string; date: string };

export const getStock = () => unwrap<StockLevel[]>(api.get("/stock"));

export const getStockMovements = () => unwrap<StockMovement[]>(api.get("/stock/movements"));

export const adjustStock = (input: { productId: string; type: StockMoveType; qty: number; reason: string; author: string }) =>
  unwrap<StockMovement>(api.post("/stock/adjust", input));

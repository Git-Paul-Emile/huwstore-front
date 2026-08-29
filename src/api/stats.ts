import { api, unwrap } from "./axiosConfig";

export type DashboardStats = { revenueToday: number; pendingOrders: number; lowStockCount: number; newClientsToday: number };
export type SalesPoint = { day: string; value: number };
export type CategorySales = { name: string; value: number };

export const getDashboardStats = () => unwrap<DashboardStats>(api.get("/stats/dashboard"));

export const getSales7Days = () => unwrap<SalesPoint[]>(api.get("/stats/sales-7-days"));

export const getSalesByCategory = () => unwrap<CategorySales[]>(api.get("/stats/sales-by-category"));

/** Meilleures ventes, classées par quantité réellement vendue (recueil Q70). */
export type TopProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string | null;
  qtySold: number;
  revenue: number;
};

export const getTopProducts = (params: { days?: number; limit?: number } = {}) =>
  unwrap<TopProduct[]>(api.get("/stats/top-products", { params }));

/**
 * Chiffres clés sur une fenêtre glissante (recueil : « Nombre de commandes,
 * Chiffre d'affaires »). Agrégés en base : justes quel que soit le volume.
 */
export type Overview = {
  periodDays: number;
  orders: number;
  revenue: number;
  paidOrders: number;
  paidRevenue: number;
  itemsSold: number;
  avgBasket: number;
};

export const getOverview = (params: { days?: number } = {}) =>
  unwrap<Overview>(api.get("/stats/overview", { params }));

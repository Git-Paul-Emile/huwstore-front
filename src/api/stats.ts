import { api, unwrap } from "./axiosConfig";

export type DashboardStats = { revenueToday: number; pendingOrders: number; lowStockCount: number; newClientsToday: number };
export type SalesPoint = { day: string; value: number };
export type CategorySales = { name: string; value: number };

export const getDashboardStats = () => unwrap<DashboardStats>(api.get("/stats/dashboard"));

export const getSales7Days = () => unwrap<SalesPoint[]>(api.get("/stats/sales-7-days"));

export const getSalesByCategory = () => unwrap<CategorySales[]>(api.get("/stats/sales-by-category"));

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getSales7Days, getSalesByCategory } from "../api/stats";

export const useDashboardStats = () => useQuery({ queryKey: ["stats", "dashboard"], queryFn: getDashboardStats });

export const useSales7Days = () => useQuery({ queryKey: ["stats", "sales-7-days"], queryFn: getSales7Days });

export const useSalesByCategory = () => useQuery({ queryKey: ["stats", "sales-by-category"], queryFn: getSalesByCategory });

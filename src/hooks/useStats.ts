import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getSales7Days, getSalesByCategory, getTopProducts } from "../api/stats";

export const useDashboardStats = () => useQuery({ queryKey: ["stats", "dashboard"], queryFn: getDashboardStats });

export const useSales7Days = () => useQuery({ queryKey: ["stats", "sales-7-days"], queryFn: getSales7Days });

export const useSalesByCategory = () => useQuery({ queryKey: ["stats", "sales-by-category"], queryFn: getSalesByCategory });

/**
 * Meilleures ventes sur une fenêtre glissante. `days` est passé dans la clé de
 * cache : changer la période déclenche une vraie requête, et non un affichage
 * périmé.
 */
export const useTopProducts = (days = 90, limit = 8) =>
  useQuery({ queryKey: ["stats", "top-products", days, limit], queryFn: () => getTopProducts({ days, limit }) });

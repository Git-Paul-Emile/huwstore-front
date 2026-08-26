import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjustStock, getStock, getStockMovements } from "../api/stock";

export const useStock = () => useQuery({ queryKey: ["stock"], queryFn: getStock });

export const useStockMovements = () => useQuery({ queryKey: ["stock", "movements"], queryFn: getStockMovements });

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

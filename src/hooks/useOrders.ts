import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, getMyOrders, getOrders, updateOrder, type OrderInput, type OrderUpdateInput } from "../api/orders";

export const useOrders = () => useQuery({ queryKey: ["orders"], queryFn: getOrders });

export const useMyOrders = () => useQuery({ queryKey: ["orders", "mine"], queryFn: getMyOrders });

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => createOrder(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: OrderUpdateInput }) => updateOrder(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrder,
  type OrderFilters,
  type OrderInput,
  type OrderUpdateInput,
} from "../api/orders";
import type { Order } from "../api/orders";

const EMPTY: Order[] = [];

/** Page de commandes + métadonnées de pagination. */
export const useOrderPage = (filters: OrderFilters = {}) =>
  useQuery({ queryKey: ["orders", filters], queryFn: () => getOrders(filters) });

/** Raccourci liste seule, pour les écrans qui n'affichent pas de pagination. */
export const useOrders = (filters: OrderFilters = {}) =>
  useQuery({ queryKey: ["orders", filters], queryFn: () => getOrders(filters), select: (page) => page.items ?? EMPTY });

/** Une commande précise, lisible seulement par son acheteuse connectée. */
export const useOrder = (id: string) =>
  useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id), enabled: Boolean(id) });

export const useMyOrders = () => useQuery({ queryKey: ["orders", "mine"], queryFn: getMyOrders });

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Une vente décrémente le stock : les produits et le stock sont périmés.
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: OrderUpdateInput }) => updateOrder(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

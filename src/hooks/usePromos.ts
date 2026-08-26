import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPromo, deletePromo, getPromos, updatePromo, type PromoInput } from "../api/promos";

export const usePromos = () => useQuery({ queryKey: ["promos"], queryFn: getPromos });

export function useCreatePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoInput) => createPromo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promos"] }),
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PromoInput> }) => updatePromo(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promos"] }),
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promos"] }),
  });
}

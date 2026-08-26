import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDeliveryZone,
  deleteDeliveryZone,
  getDeliveryZones,
  updateDeliveryZone,
  type DeliveryZoneInput,
} from "../api/deliveryZones";

export const useDeliveryZones = () => useQuery({ queryKey: ["delivery-zones"], queryFn: getDeliveryZones });

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeliveryZoneInput) => createDeliveryZone(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DeliveryZoneInput> }) => updateDeliveryZone(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeliveryZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

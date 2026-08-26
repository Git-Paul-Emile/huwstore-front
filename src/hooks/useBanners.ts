import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBanner, deleteBanner, getBanners, updateBanner, type BannerInput } from "../api/banners";

export const useBanners = () => useQuery({ queryKey: ["banners"], queryFn: getBanners });

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BannerInput) => createBanner(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BannerInput> }) => updateBanner(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

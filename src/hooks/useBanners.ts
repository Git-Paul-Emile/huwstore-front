import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
  type BannerInput,
  type BannerSlot,
} from "../api/banners";

/** Vitrine : uniquement ce qui est réellement diffusable aujourd'hui. */
export const useBanners = (slot?: BannerSlot) =>
  useQuery({ queryKey: ["banners", { slot }], queryFn: () => getBanners({ slot }) });

/** Back-office : tout, y compris les campagnes passées et désactivées. */
export const useAllBanners = () =>
  useQuery({ queryKey: ["banners", { all: true }], queryFn: () => getBanners({ all: true }) });

function useBannerMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export const useCreateBanner = () => useBannerMutation((input: BannerInput) => createBanner(input));

export const useUpdateBanner = () =>
  useBannerMutation(({ id, input }: { id: string; input: Partial<BannerInput> }) => updateBanner(id, input));

export const useDeleteBanner = () => useBannerMutation((id: string) => deleteBanner(id));

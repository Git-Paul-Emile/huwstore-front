import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProductOption,
  deleteProductOption,
  getProductOptions,
  updateProductOption,
  type ProductOptionInput,
} from "../api/productOptions";

/**
 * Listes « Matière » et « Fermeture » du formulaire produit, gérées depuis le
 * back-office. Peu volatiles : 5 minutes sans refetch automatique.
 */
export const useProductOptions = () =>
  useQuery({ queryKey: ["product-options"], queryFn: getProductOptions, staleTime: 5 * 60 * 1000 });

function useProductOptionMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-options"] }),
  });
}

export const useCreateProductOption = () =>
  useProductOptionMutation((input: ProductOptionInput) => createProductOption(input));

export const useUpdateProductOption = () =>
  useProductOptionMutation(({ id, input }: { id: string; input: { label?: string; position?: number } }) =>
    updateProductOption(id, input),
  );

export const useDeleteProductOption = () => useProductOptionMutation((id: string) => deleteProductOption(id));

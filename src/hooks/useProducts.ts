import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductFacets,
  getProducts,
  updateProduct,
  type ProductFilters,
  type ProductInput,
  type ProductUpdateInput,
} from "../api/products";
import type { Product } from "../data";

const EMPTY: Product[] = [];

/** Page de produits + métadonnées de pagination. */
export const useProductPage = (filters: ProductFilters = {}) =>
  useQuery({ queryKey: ["products", filters], queryFn: () => getProducts(filters) });

/**
 * Raccourci quand seule la liste compte (cartes, suggestions).
 * `select` évite de recréer un tableau à chaque rendu : React Query mémorise
 * le résultat tant que la donnée n'a pas changé.
 */
export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    select: (page) => page.items ?? EMPTY,
  });

export const useProduct = (idOrSlug: string) =>
  useQuery({ queryKey: ["products", "detail", idOrSlug], queryFn: () => getProduct(idOrSlug), enabled: !!idOrSlug });

/** Matières et couleurs réellement présentes au catalogue. */
export const useProductFacets = () =>
  useQuery({ queryKey: ["products", "facets"], queryFn: getProductFacets, staleTime: 5 * 60 * 1000 });

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductUpdateInput }) => updateProduct(id, input),
    // Modifier les coloris crée/archive des lignes de stock : l'écran Stock est périmé.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

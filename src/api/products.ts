import { api, unwrap, unwrapPage } from "./axiosConfig";
import type { Product, ProductFacets } from "../data";

export type ProductFilters = {
  category?: string;
  material?: string;
  /** Nom ou slug de couleur — l'API accepte les deux. */
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "new";
  page?: number;
  limit?: number;
  /** Vue admin : inclut les produits désactivés. */
  all?: boolean;
};

export type VariantInput = {
  sku?: string;
  color: string;
  colorSlug: string;
  hex: string;
  hexSecondary?: string;
  images: string[];
  stockQty?: number;
  stockThreshold?: number;
};

export type ProductInput = {
  id?: string;
  slug?: string;
  name: string;
  collection: string;
  categoryId: string;
  material: string;
  description: string;
  care: string;
  price: number;
  compareAt?: number;
  badge?: "Nouveau" | "Promo" | "Rupture";
  videoUrl?: string;
  closure?: string;
  capacity?: string;
  widthTopMm?: number;
  widthBottomMm?: number;
  heightMm?: number;
  depthMm?: number;
  handleDropMm?: number;
  weightGrams?: number;
  features?: string[];
  active?: boolean;
  variants: VariantInput[];
};

/** Les champs modifiables après création — les déclinaisons ont leurs propres routes. */
export type ProductUpdateInput = Partial<Omit<ProductInput, "id" | "variants">>;

export const getProducts = (filters: ProductFilters = {}) =>
  unwrapPage<Product>(api.get("/products", { params: filters }));

export const getProductFacets = () => unwrap<ProductFacets>(api.get("/products/facets"));

/** Accepte l'identifiant ou le slug. */
export const getProduct = (idOrSlug: string) => unwrap<Product>(api.get(`/products/${idOrSlug}`));

export const createProduct = (input: ProductInput) => unwrap<Product>(api.post("/products", input));

export const updateProduct = (id: string, input: ProductUpdateInput) => unwrap<Product>(api.patch(`/products/${id}`, input));

export const deleteProduct = (id: string) => unwrap<null>(api.delete(`/products/${id}`));

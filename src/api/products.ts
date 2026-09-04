import { api, unwrap, unwrapPage } from "./axiosConfig";
import type { Product, ProductFacets } from "../data";

/**
 * Filtres de collection. `category`, `material` et `color` acceptent une valeur
 * ou une liste : les valeurs d'un même filtre s'additionnent (OU), les filtres
 * entre eux se cumulent (ET).
 */
export type ProductFilters = {
  category?: string | string[];
  material?: string | string[];
  /** Nom ou slug de couleur - l'API accepte les deux. */
  color?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  /** `best` classe par quantités réellement vendues, calculées côté serveur. */
  sort?: "best" | "price-asc" | "price-desc" | "new";
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

/**
 * Déclinaison en mise à jour. `id` présent = coloris existant (on modifie ses
 * libellés et sa galerie) ; `id` absent = nouveau coloris (stock initial 0). La
 * quantité en stock ne s'édite pas ici : elle passe par l'écran Stock.
 */
export type VariantUpdateInput = {
  id?: string;
  color: string;
  colorSlug: string;
  hex: string;
  hexSecondary?: string;
  images: string[];
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
  includedAccessory?: string;
  active?: boolean;
  variants: VariantInput[];
};

/**
 * Champs modifiables après création. `variants`, s'il est fourni, décrit l'état
 * complet voulu des coloris : ceux absents sont archivés côté serveur.
 */
export type ProductUpdateInput = Partial<Omit<ProductInput, "id" | "variants" | "videoUrl">> & {
  /** Chaîne = nouvelle URL ; `null` = retirer la vidéo ; absent = ne pas toucher. */
  videoUrl?: string | null;
  variants?: VariantUpdateInput[];
};

/** Les listes partent en une seule valeur séparée par des virgules. */
const toParams = (filters: ProductFilters) =>
  Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value]),
  );

export const getProducts = (filters: ProductFilters = {}) =>
  unwrapPage<Product>(api.get("/products", { params: toParams(filters) }));

export const getProductFacets = () => unwrap<ProductFacets>(api.get("/products/facets"));

/** Accepte l'identifiant ou le slug. */
export const getProduct = (idOrSlug: string) => unwrap<Product>(api.get(`/products/${idOrSlug}`));

export const createProduct = (input: ProductInput) => unwrap<Product>(api.post("/products", input));

export const updateProduct = (id: string, input: ProductUpdateInput) => unwrap<Product>(api.patch(`/products/${id}`, input));

export const deleteProduct = (id: string): Promise<void> => api.delete(`/products/${id}`).then(() => undefined);

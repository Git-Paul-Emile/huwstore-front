import { api, unwrap } from "./axiosConfig";
import type { Product } from "../data";

export type ProductFilters = {
  category?: string;
  material?: string;
  color?: string;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "new";
  all?: boolean;
};

export type ProductInput = {
  id?: string;
  name: string;
  collection: string;
  categoryId: string;
  material: string;
  color: string;
  price: number;
  compareAt?: number;
  badge?: "Nouveau" | "Promo" | "Rupture";
  image: string;
  imageAlt: string;
  imageHover: string;
  active?: boolean;
  stockQty?: number;
  stockThreshold?: number;
};

export const getProducts = (filters: ProductFilters = {}) => unwrap<Product[]>(api.get("/products", { params: filters }));

export const getProduct = (id: string) => unwrap<Product>(api.get(`/products/${id}`));

export const createProduct = (input: ProductInput) => unwrap<Product>(api.post("/products", input));

export const updateProduct = (id: string, input: Partial<ProductInput>) => unwrap<Product>(api.patch(`/products/${id}`, input));

export const deleteProduct = (id: string) => unwrap<null>(api.delete(`/products/${id}`));

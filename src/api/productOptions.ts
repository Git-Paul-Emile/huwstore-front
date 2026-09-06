import { api, unwrap } from "./axiosConfig";

/** Listes déroulantes « Matière » et « Fermeture » du formulaire produit. */
export type ProductOptionKind = "matiere" | "fermeture";

export type ProductOption = {
  id: string;
  kind: ProductOptionKind;
  label: string;
  position: number;
};

export type ProductOptionLists = {
  matiere: ProductOption[];
  fermeture: ProductOption[];
};

export type ProductOptionInput = { kind: ProductOptionKind; label: string; position?: number };

export const getProductOptions = () => unwrap<ProductOptionLists>(api.get("/product-options"));

export const createProductOption = (input: ProductOptionInput) =>
  unwrap<ProductOption>(api.post("/product-options", input));

export const updateProductOption = (id: string, input: { label?: string; position?: number }) =>
  unwrap<ProductOption>(api.patch(`/product-options/${id}`, input));

export const deleteProductOption = (id: string): Promise<void> =>
  api.delete(`/product-options/${id}`).then(() => undefined);

import { api, unwrap } from "./axiosConfig";
import type { Category } from "../data";

/** Longueur maximale du résumé, alignée sur la validation du serveur. */
export const CATEGORY_DESCRIPTION_MAX = 110;

/** `position` fixe l'ordre d'affichage des univers sur la page d'accueil. */
export type CategoryInput = { name: string; image: string; description?: string; position?: number };

export const getCategories = () => unwrap<Category[]>(api.get("/categories"));

export const createCategory = (input: CategoryInput) => unwrap<Category>(api.post("/categories", input));

export const updateCategory = (id: string, input: Partial<CategoryInput>) =>
  unwrap<Category>(api.patch(`/categories/${id}`, input));

export const deleteCategory = (id: string) => unwrap<null>(api.delete(`/categories/${id}`));

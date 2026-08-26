import { api, unwrap } from "./axiosConfig";
import type { Category } from "../data";

export type CategoryInput = { name: string; image: string };

export const getCategories = () => unwrap<Category[]>(api.get("/categories"));

export const createCategory = (input: CategoryInput) => unwrap<Category>(api.post("/categories", input));

export const updateCategory = (id: string, input: Partial<CategoryInput>) =>
  unwrap<Category>(api.patch(`/categories/${id}`, input));

export const deleteCategory = (id: string) => unwrap<null>(api.delete(`/categories/${id}`));

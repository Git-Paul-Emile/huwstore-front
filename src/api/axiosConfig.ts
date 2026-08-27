import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import type { PageMeta, Paginated } from "../data";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type ApiEnvelope<T> = { status: string; message: string; data: T; meta?: PageMeta };

/** Extrait la ressource de l'enveloppe API. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

/**
 * Variante pour les collections paginées : rend les éléments ET les
 * métadonnées, au lieu de perdre la pagination en route.
 */
export async function unwrapPage<T>(promise: Promise<{ data: ApiEnvelope<T[]> }>): Promise<Paginated<T>> {
  const response = await promise;
  const { data, meta } = response.data;
  return {
    items: data,
    meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1, hasNext: false, hasPrev: false },
  };
}

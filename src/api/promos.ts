import { api, unwrap } from "./axiosConfig";

export type Promo = {
  id: string;
  code: string;
  type: "Pourcentage" | "Montant fixe" | "Livraison offerte";
  value: number;
  minCart: number;
  used: number;
  limit: number;
  end: string;
  active: boolean;
};

export type PromoInput = Omit<Promo, "id" | "used">;

export const getPromos = () => unwrap<Promo[]>(api.get("/promos"));

export const createPromo = (input: PromoInput) => unwrap<Promo>(api.post("/promos", input));

export const updatePromo = (id: string, input: Partial<PromoInput>) => unwrap<Promo>(api.patch(`/promos/${id}`, input));

export const deletePromo = (id: string) => unwrap<null>(api.delete(`/promos/${id}`));

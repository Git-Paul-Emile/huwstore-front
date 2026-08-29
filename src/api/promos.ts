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

/** Détail du montant renvoyé par la vérification d'un code. */
export type PromoQuote = {
  code: string | null;
  label: string | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
};

export type PromoValidateInput = {
  code: string;
  items: { variantId: string; qty: number }[];
  deliveryZoneId?: string;
  deliveryMode?: "Domicile" | "Point relais";
};

/**
 * Vérifie un code contre le contenu réel du panier. C'est le serveur qui
 * calcule la remise : le front n'applique jamais de pourcentage lui-même.
 */
export const validatePromo = (input: PromoValidateInput) => unwrap<PromoQuote>(api.post("/promos/validate", input));

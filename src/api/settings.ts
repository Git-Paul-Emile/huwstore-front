import { api, unwrap } from "./axiosConfig";

/**
 * Paramètres de la boutique.
 *
 * Ils remplacent les constantes qui vivaient dans le code du front (numéro de
 * téléphone, WhatsApp, réseaux sociaux) : la boutique les modifie depuis
 * l'interface, sans redéploiement.
 */
export type Settings = {
  shopName: string;
  phone: string;
  /** Format international sans « + », pour construire les liens wa.me. */
  whatsapp: string;
  email?: string;
  city: string;
  country: string;
  addressLine?: string;
  ninea?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  /** Lien du bouton WhatsApp affiché dans les réseaux sociaux du pied de page. */
  whatsappUrl?: string;
  announcement?: string;
};

export type SettingsInput = Partial<Settings>;

export const getSettings = () => unwrap<Settings>(api.get("/settings"));

export const updateSettings = (input: SettingsInput) => unwrap<Settings>(api.patch("/settings", input));

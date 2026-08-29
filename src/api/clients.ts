import { api, unwrap } from "./axiosConfig";

export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  orders: number;
  spent: number;
  since: string;
  segment: "VIP" | "Nouveau" | "Inactif" | "Fidèle";
};

export const getClients = () => unwrap<Client[]>(api.get("/clients"));

/** Export CSV du fichier clientes : le serveur renvoie un fichier, pas du JSON. */
export const exportClientsCsv = () =>
  api.get("/clients/export", { responseType: "blob" }).then((res) => res.data as Blob);

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

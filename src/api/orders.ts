import { api, unwrap } from "./axiosConfig";

export type OrderStatus = "En préparation" | "Expédiée" | "En cours de livraison" | "Livrée" | "Retournée";
export type PayStatus = "Payé" | "En attente" | "Échoué";
export type PayMethod = "Wave" | "Orange Money" | "Paiement à la livraison" | "Carte";

export type Order = {
  id: string;
  client: string;
  city: string;
  country: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  pay: PayStatus;
  method: PayMethod;
  status: OrderStatus;
  courier?: string;
  tracking?: string;
  date: string;
};

export type OrderInput = {
  client: string;
  city: string;
  country: string;
  method: PayMethod;
  items: { productId: string; qty: number }[];
};

export type OrderUpdateInput = Partial<Pick<Order, "status" | "pay" | "courier" | "tracking">>;

export const getOrders = () => unwrap<Order[]>(api.get("/orders"));

export const getMyOrders = () => unwrap<Order[]>(api.get("/orders/mine"));

export const createOrder = (input: OrderInput) => unwrap<Order>(api.post("/orders", input));

export const updateOrder = (id: string, input: OrderUpdateInput) => unwrap<Order>(api.patch(`/orders/${id}`, input));

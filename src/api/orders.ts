import { api, unwrap, unwrapPage } from "./axiosConfig";

export type OrderStatus = "En préparation" | "Expédiée" | "En cours de livraison" | "Livrée" | "Retournée";
export type PayStatus = "Payé" | "En attente" | "Échoué";
export type PayMethod = "Wave" | "Orange Money" | "Paiement à la livraison" | "Carte";

/** Le coloris est figé sur la ligne : il ne suit pas les évolutions du catalogue. */
export type OrderItem = {
  productId: string;
  variantId?: string;
  name: string;
  color?: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  client: string;
  city: string;
  country: string;
  items: OrderItem[];
  total: number;
  pay: PayStatus;
  method: PayMethod;
  status: OrderStatus;
  courier?: string;
  tracking?: string;
  date: string;
};

export type OrderFilters = {
  status?: OrderStatus;
  pay?: PayStatus;
  search?: string;
  sort?: "recent" | "oldest" | "total-desc" | "total-asc";
  page?: number;
  limit?: number;
};

export type OrderInput = {
  client: string;
  city: string;
  country: string;
  method: PayMethod;
  /** On commande une déclinaison précise, jamais un produit « toutes couleurs ». */
  items: { variantId: string; qty: number }[];
};

export type OrderUpdateInput = Partial<Pick<Order, "status" | "pay" | "courier" | "tracking">>;

export const getOrders = (filters: OrderFilters = {}) => unwrapPage<Order>(api.get("/orders", { params: filters }));

export const getMyOrders = () => unwrap<Order[]>(api.get("/orders/mine"));

export const createOrder = (input: OrderInput) => unwrap<Order>(api.post("/orders", input));

export const updateOrder = (id: string, input: OrderUpdateInput) => unwrap<Order>(api.patch(`/orders/${id}`, input));

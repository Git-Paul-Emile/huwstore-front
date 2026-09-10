import { api, unwrap, unwrapPage } from "./axiosConfig";

export type OrderStatus = "En préparation" | "Expédiée" | "En cours de livraison" | "Livrée" | "Retournée";
export type PayStatus = "Payé" | "En attente" | "Échoué";

/**
 * Seul mode enregistré côté serveur. Sur Dakar il correspond au paiement en
 * espèces à la livraison. Pour les autres régions, la cliente paie d'avance par
 * Wave ou Orange Money hors du site (preuve WhatsApp) : ce paiement n'est pas
 * suivi ici, la commande reste marquée « Paiement à la livraison » et la
 * boutique vérifie l'encaissement à la main avant d'expédier.
 */
export const PAY_METHOD_COD = "Paiement à la livraison" as const;
export type PayMethod = typeof PAY_METHOD_COD;

export type DeliveryMode = "Domicile" | "Point relais";

/** Le coloris est figé sur la ligne : il ne suit pas les évolutions du catalogue. */
export type OrderItem = {
  productId: string;
  variantId?: string;
  name: string;
  color?: string;
  qty: number;
  price: number;
  /** Visuel actuel du catalogue (déclinaison, sinon produit). Absent si l'article n'a plus d'image. */
  image?: string;
};

export type Order = {
  id: string;
  client: string;
  phone: string;
  email?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  country: string;
  deliveryMode: DeliveryMode;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  promoCode?: string;
  total: number;
  pay: PayStatus;
  method: PayMethod;
  status: OrderStatus;
  courier?: string;
  tracking?: string;
  note?: string;
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

/**
 * Ce que le navigateur a le droit d'envoyer. Aucun montant n'y figure :
 * sous-total, frais de port et remise sont recalculés par le serveur à partir
 * des déclinaisons, de la zone et du code promo.
 */
export type OrderInput = {
  client: string;
  phone: string;
  email?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  country: string;
  deliveryMode: DeliveryMode;
  deliveryZoneId?: string;
  method?: typeof PAY_METHOD_COD;
  promoCode?: string;
  note?: string;
  items: { variantId: string; qty: number }[];
};

export type OrderUpdateInput = Partial<Pick<Order, "status" | "pay" | "courier" | "tracking">>;

export const getOrders = (filters: OrderFilters = {}) => unwrapPage<Order>(api.get("/orders", { params: filters }));

export const getMyOrders = () => unwrap<Order[]>(api.get("/orders/mine"));

/** Lecture d'une commande : réservée à son acheteuse connectée. */
export const getOrder = (id: string) => unwrap<Order>(api.get(`/orders/${id}`));

/** Facture PDF. Le serveur renvoie un fichier, pas l'enveloppe JSON habituelle. */
export const downloadInvoice = (id: string) =>
  api.get(`/orders/${id}/invoice`, { responseType: "blob" }).then((res) => res.data as Blob);

export const createOrder = (input: OrderInput) => unwrap<Order>(api.post("/orders", input));

export const updateOrder = (id: string, input: OrderUpdateInput) => unwrap<Order>(api.patch(`/orders/${id}`, input));

/** Export CSV : le serveur renvoie un fichier, pas l'enveloppe JSON habituelle. */
export const exportOrdersCsv = (filters: OrderFilters = {}) =>
  api.get("/orders/export", { params: filters, responseType: "blob" }).then((res) => res.data as Blob);

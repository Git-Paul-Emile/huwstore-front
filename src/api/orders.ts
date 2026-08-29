import { api, unwrap, unwrapPage } from "./axiosConfig";

export type OrderStatus = "En préparation" | "Expédiée" | "En cours de livraison" | "Livrée" | "Retournée";
export type PayStatus = "Payé" | "En attente" | "Échoué";

/**
 * La boutique encaisse à la livraison, en espèces, et rien d'autre : aucun
 * paiement en ligne n'est proposé et aucune coordonnée bancaire n'est collectée.
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
};

export type Order = {
  id: string;
  /**
   * Jeton de lecture, renvoyé UNIQUEMENT à la création de la commande. C'est
   * lui qui permet à une acheteuse sans compte de revenir sur son reçu et de
   * télécharger sa facture.
   */
  publicToken?: string;
  /** Vrai quand la commande a été passée sans compte. */
  guest?: boolean;
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

/**
 * Lecture d'une commande. Le jeton n'est nécessaire que pour une commande
 * passée sans compte : connectée, la cliente est reconnue par son jeton d'accès.
 */
export const getOrder = (id: string, token?: string) =>
  unwrap<Order>(api.get(`/orders/${id}`, { params: token ? { token } : undefined }));

/** Facture PDF. Le serveur renvoie un fichier, pas l'enveloppe JSON habituelle. */
export const downloadInvoice = (id: string, token?: string) =>
  api
    .get(`/orders/${id}/invoice`, { params: token ? { token } : undefined, responseType: "blob" })
    .then((res) => res.data as Blob);

export const createOrder = (input: OrderInput) => unwrap<Order>(api.post("/orders", input));

export const updateOrder = (id: string, input: OrderUpdateInput) => unwrap<Order>(api.patch(`/orders/${id}`, input));

/** Export CSV : le serveur renvoie un fichier, pas l'enveloppe JSON habituelle. */
export const exportOrdersCsv = (filters: OrderFilters = {}) =>
  api.get("/orders/export", { params: filters, responseType: "blob" }).then((res) => res.data as Blob);

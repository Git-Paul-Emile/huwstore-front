import { api, unwrap } from "./axiosConfig";

/**
 * Il ne reste qu'UN emplacement : le bandeau promotionnel de la page d'accueil.
 *
 * « Hero » et « Pop-up » ne sont plus proposés - le premier parce que le haut
 * de l'accueil est devenu un bloc fixe écrit dans le code, le second parce
 * qu'il ne s'affichait nulle part. Le serveur les refuse à la création ; ils
 * restent dans le type pour que les bannières créées avant s'affichent encore
 * dans la liste du back-office et puissent y être supprimées.
 */
export const BANNER_SLOTS = ["Bandeau promo"] as const;

export type BannerSlot = (typeof BANNER_SLOTS)[number] | "Hero" | "Pop-up";

/**
 * Destination du bouton. « Page libre » : on saisit le chemin à la main
 * (ctaHref). « Catégorie » / « Produit » : on choisit une cible du catalogue,
 * le serveur en déduit ctaHref.
 */
export const BANNER_LINK_TYPES = ["Page libre", "Catégorie", "Produit"] as const;

export type BannerLinkType = (typeof BANNER_LINK_TYPES)[number];

export type Banner = {
  id: string;
  title: string;
  /** Deuxième ligne du titre, affichée en italique sous la première. */
  subtitle?: string;
  text?: string;
  ctaLabel?: string;
  linkType: BannerLinkType;
  /** Renseigné quand linkType vaut « Catégorie ». */
  linkCategoryId?: string;
  /** Renseigné quand linkType vaut « Produit ». */
  linkProductId?: string;
  /** Chemin interne, calculé par le serveur d'après la destination choisie. */
  ctaHref?: string;
  slot: BannerSlot;
  target: "Toutes" | "Mobile" | "Desktop";
  position: number;
  start: string;
  end: string;
  active: boolean;
  image: string;
};

/**
 * À l'envoi, une seule piste de destination est renseignée selon `linkType` ;
 * `null` sur les deux autres les détache côté serveur.
 */
export type BannerInput = Omit<Banner, "id" | "linkCategoryId" | "linkProductId" | "ctaHref"> & {
  linkCategoryId?: string | null;
  linkProductId?: string | null;
  ctaHref?: string | null;
};

/**
 * `all` n'est utilisé que par le back-office : la vitrine ne reçoit que les
 * bannières actives et dans leur fenêtre de diffusion.
 */
export const getBanners = (params: { slot?: BannerSlot; all?: boolean } = {}) =>
  unwrap<Banner[]>(api.get("/banners", { params }));

export const createBanner = (input: BannerInput) => unwrap<Banner>(api.post("/banners", input));

export const updateBanner = (id: string, input: Partial<BannerInput>) =>
  unwrap<Banner>(api.patch(`/banners/${id}`, input));

export const deleteBanner = (id: string): Promise<void> => api.delete(`/banners/${id}`).then(() => undefined);

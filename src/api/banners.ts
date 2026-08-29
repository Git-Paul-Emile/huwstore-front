import { api, unwrap } from "./axiosConfig";

export type BannerSlot = "Hero" | "Bandeau promo" | "Pop-up";

export type Banner = {
  id: string;
  title: string;
  /** Deuxième ligne du titre, affichée en italique sous la première. */
  subtitle?: string;
  text?: string;
  ctaLabel?: string;
  /** Toujours un chemin interne, ex. /boutique. */
  ctaHref?: string;
  slot: BannerSlot;
  target: "Toutes" | "Mobile" | "Desktop";
  focus: "center" | "top" | "bottom";
  position: number;
  start: string;
  end: string;
  active: boolean;
  image: string;
};

export type BannerInput = Omit<Banner, "id">;

/**
 * `all` n'est utilisé que par le back-office : la vitrine ne reçoit que les
 * bannières actives et dans leur fenêtre de diffusion.
 */
export const getBanners = (params: { slot?: BannerSlot; all?: boolean } = {}) =>
  unwrap<Banner[]>(api.get("/banners", { params }));

export const createBanner = (input: BannerInput) => unwrap<Banner>(api.post("/banners", input));

export const updateBanner = (id: string, input: Partial<BannerInput>) =>
  unwrap<Banner>(api.patch(`/banners/${id}`, input));

export const deleteBanner = (id: string) => unwrap<null>(api.delete(`/banners/${id}`));

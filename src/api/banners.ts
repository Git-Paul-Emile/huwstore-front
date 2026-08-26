import { api, unwrap } from "./axiosConfig";

export type Banner = {
  id: string;
  title: string;
  slot: "Hero" | "Bandeau promo" | "Pop-up";
  target: "Toutes" | "Mobile" | "Desktop";
  start: string;
  end: string;
  active: boolean;
  image: string;
};

export type BannerInput = Omit<Banner, "id">;

export const getBanners = () => unwrap<Banner[]>(api.get("/banners"));

export const createBanner = (input: BannerInput) => unwrap<Banner>(api.post("/banners", input));

export const updateBanner = (id: string, input: Partial<BannerInput>) => unwrap<Banner>(api.patch(`/banners/${id}`, input));

export const deleteBanner = (id: string) => unwrap<null>(api.delete(`/banners/${id}`));

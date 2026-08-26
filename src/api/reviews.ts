import { api, unwrap } from "./axiosConfig";

export type Review = {
  id: string;
  product: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  status: "En attente" | "Publié" | "Rejeté";
};

export const getReviews = () => unwrap<Review[]>(api.get("/reviews"));

export const createReview = (input: { productId: string; author: string; rating: number; text: string }) =>
  unwrap<Review>(api.post("/reviews", input));

export const updateReviewStatus = (id: string, status: Review["status"]) =>
  unwrap<Review>(api.patch(`/reviews/${id}/status`, { status }));

import { api, unwrap } from "./axiosConfig";

export type Feedback = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export type FeedbackInput = {
  name?: string;
  phone?: string;
  email?: string;
  message: string;
};

/** Ouvert à toute visiteuse, avec ou sans compte. */
export const createFeedback = (input: FeedbackInput) => unwrap<Feedback>(api.post("/feedback", input));

/** Réservé au back-office : les avis ne sont jamais publiés automatiquement. */
export const getFeedbacks = () => unwrap<Feedback[]>(api.get("/feedback"));

export const markFeedbackRead = (id: string, read: boolean) =>
  unwrap<Feedback>(api.patch(`/feedback/${id}`, { read }));

export const deleteFeedback = (id: string): Promise<void> => api.delete(`/feedback/${id}`).then(() => undefined);

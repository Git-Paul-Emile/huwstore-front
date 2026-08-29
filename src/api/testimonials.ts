import { api, unwrap } from "./axiosConfig";

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  text: string;
  avatar: string | null;
  position: number;
  active: boolean;
};

export type TestimonialInput = Omit<Testimonial, "id">;

export const getTestimonials = () => unwrap<Testimonial[]>(api.get("/testimonials"));

export const createTestimonial = (input: TestimonialInput) =>
  unwrap<Testimonial>(api.post("/testimonials", input));

export const updateTestimonial = (id: string, input: Partial<TestimonialInput>) =>
  unwrap<Testimonial>(api.patch(`/testimonials/${id}`, input));

export const deleteTestimonial = (id: string) => unwrap<null>(api.delete(`/testimonials/${id}`));

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
  type TestimonialInput,
} from "../api/testimonials";

export const useTestimonials = () => useQuery({ queryKey: ["testimonials"], queryFn: getTestimonials });

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TestimonialInput) => createTestimonial(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TestimonialInput> }) => updateTestimonial(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

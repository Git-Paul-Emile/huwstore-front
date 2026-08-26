import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, getReviews, updateReviewStatus, type Review } from "../api/reviews";

export const useReviews = () => useQuery({ queryKey: ["reviews"], queryFn: getReviews });

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Review["status"] }) => updateReviewStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

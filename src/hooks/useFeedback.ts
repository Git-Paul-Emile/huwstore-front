import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFeedback,
  deleteFeedback,
  getFeedbacks,
  markFeedbackRead,
  type FeedbackInput,
} from "../api/feedback";

export function useCreateFeedback() {
  return useMutation({ mutationFn: (input: FeedbackInput) => createFeedback(input) });
}

export const useFeedbacks = () => useQuery({ queryKey: ["feedback"], queryFn: getFeedbacks });

export function useMarkFeedbackRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => markFeedbackRead(id, read),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

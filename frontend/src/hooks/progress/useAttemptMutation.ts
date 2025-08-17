// src/hooks/progress/useAttemptMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAttempt } from "../../services/progressService";
import { qk } from "./queryKeys";

export const useAttemptMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postAttempt,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.overview });
      qc.invalidateQueries({ queryKey: qk.streak });
      qc.invalidateQueries({ queryKey: qk.achievements });
    },
  });
};

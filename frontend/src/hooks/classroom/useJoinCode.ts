// src/hooks/classroom/useJoinCode.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";
import { showToast } from "../../utils/showToast";
import { isAxiosError } from "axios";

type ErrorPayload = { message?: string };

function getApiMessage(err: unknown, fallback = "Ocurrió un error.") {
  if (isAxiosError<ErrorPayload>(err)) {
    return err.response?.data?.message ?? err.message ?? fallback;
  }
  return fallback;
}

export function useActiveJoinCode(classroomId?: string) {
  return useQuery({
    queryKey: classroomId
      ? classroomKeys.joinCode(classroomId)
      : ["classrooms", "join-code", "noop"],
    enabled: !!classroomId,
    // ⬇️ 404 => no hay código => devolvemos null (NO error)
    queryFn: async () => {
      try {
        return await classroomApi.getActiveJoinCode(classroomId!);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useGenerateJoinCodeMutation(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ttlMinutes?: number; maxUses?: number | null }) =>
      classroomApi.generateJoinCode(classroomId, payload),
    onSuccess: () => {
      showToast.success("Código generado.");
      qc.invalidateQueries({ queryKey: classroomKeys.joinCode(classroomId) });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo generar el código.")),
  });
}

export function useRevokeJoinCodeMutation(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => classroomApi.revokeJoinCode(classroomId),
    onSuccess: () => {
      showToast.success("Código revocado.");
      qc.invalidateQueries({ queryKey: classroomKeys.joinCode(classroomId) });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo revocar el código.")),
  });
}

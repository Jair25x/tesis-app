// src/hooks/classroom/useMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";
import { showToast } from "../../utils/showToast";
import type {
  ClassroomUpsertPayload,
  UUID,
  MemberRole,
  ClassroomSummaryDto,
} from "../../types/classroom/ClassroomTypes";
import { isAxiosError } from "axios";

type ErrorPayload = { message?: string };

function getApiMessage(err: unknown, fallback = "Ocurrió un error.") {
  if (isAxiosError<ErrorPayload>(err)) {
    return err.response?.data?.message ?? err.message ?? fallback;
  }
  return fallback;
}

export function useCreateClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClassroomUpsertPayload) =>
      classroomApi.create(payload),
    onSuccess: () => {
      showToast.success("Aula creada.");
      qc.invalidateQueries({ queryKey: classroomKeys.mine });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo crear el aula.")),
  });
}

export function useUpdateClassroom(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClassroomUpsertPayload>) =>
      classroomApi.update(id, payload),
    onSuccess: () => {
      showToast.success("Aula actualizada.");
      qc.invalidateQueries({ queryKey: classroomKeys.detail(id) });
      qc.invalidateQueries({ queryKey: classroomKeys.mine });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo actualizar el aula.")),
  });
}

export function useRemoveClassroom(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => classroomApi.remove(id),
    onSuccess: () => {
      showToast.success("Aula eliminada.");
      qc.invalidateQueries({ queryKey: classroomKeys.mine });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo eliminar el aula.")),
  });
}

export function useAddMember(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userUuid, role }: { userUuid: UUID; role?: MemberRole }) =>
      classroomApi.addMember(id, userUuid, role),
    onSuccess: () => {
      showToast.success("Miembro agregado.");
      qc.invalidateQueries({ queryKey: classroomKeys.members(id) });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo agregar el miembro.")),
  });
}

export function useRemoveMember(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userUuid: UUID) => classroomApi.removeMember(id, userUuid),
    onSuccess: () => {
      showToast.success("Miembro expulsado.");
      qc.invalidateQueries({ queryKey: classroomKeys.members(id) });
    },
    onError: (err: unknown) =>
      showToast.error(getApiMessage(err, "No se pudo expulsar al miembro.")),
  });
}

export function useJoinByCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { code: string }) => classroomApi.joinByCode(payload),
    onSuccess: () => {
      showToast.success("Te uniste al aula.");
      qc.invalidateQueries({ queryKey: classroomKeys.enrolled });
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404)
          return showToast.error("Código inválido o expirado.");
        if (status === 409)
          return showToast.error("Código agotado (sin usos disponibles).");
      }
      showToast.error(getApiMessage(err, "No se pudo unir al aula."));
    },
  });
}

/** ✅ Salir del aula (self-service) con contexto tipado y revert optimista */
export function useLeaveClassroom() {
  const qc = useQueryClient();

  return useMutation<void, unknown, UUID, { previous?: ClassroomSummaryDto[] }>(
    {
      mutationFn: (id: UUID) => classroomApi.leaveMyMembership(id),

      onMutate: async (id: UUID) => {
        await qc.cancelQueries({ queryKey: classroomKeys.enrolled });

        const previous = qc.getQueryData<ClassroomSummaryDto[]>(
          classroomKeys.enrolled
        );

        if (previous) {
          qc.setQueryData<ClassroomSummaryDto[]>(
            classroomKeys.enrolled,
            previous.filter((c) => c.id !== id)
          );
        }

        // 👇 devolvemos contexto tipado para onError
        return { previous };
      },

      onError: (err, _id, ctx) => {
        // 👇 ahora ctx.previous está tipado
        if (ctx?.previous) {
          qc.setQueryData(classroomKeys.enrolled, ctx.previous);
        }

        if (isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 403) {
            return showToast.error(
              "No puedes salir: eres el owner. Transfiere la propiedad primero."
            );
          }
          if (status === 404) {
            return showToast.error("Aula no encontrada.");
          }
        }
        showToast.error(getApiMessage(err, "No se pudo salir del aula."));
      },

      onSuccess: () => {
        showToast.success("Saliste del aula.");
      },

      onSettled: () => {
        qc.invalidateQueries({ queryKey: classroomKeys.enrolled });
      },
    }
  );
}

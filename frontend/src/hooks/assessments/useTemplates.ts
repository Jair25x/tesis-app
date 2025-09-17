// src/hooks/assessments/useTemplates.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  getTemplate,
} from "../../services/assessmentsService";
import { assessmentsKeys } from "./queryKeys";
import { showToast } from "../../utils/showToast";
import type { TemplateRequest } from "../../types/assessments/templates";

export function useTemplatesList(params?: {
  page?: number;
  size?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: assessmentsKeys.templates(params),
    queryFn: () => listTemplates(params),
    staleTime: 30_000,
  });
}

export function useTemplateDetail(id?: string) {
  return useQuery({
    queryKey: id ? assessmentsKeys.template(id) : ["__noop__"],
    queryFn: () => (id ? getTemplate(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useTemplateMutations() {
  const qc = useQueryClient();

  const createM = useMutation({
    mutationFn: (body: TemplateRequest) => createTemplate(body),
    onSuccess: () => {
      showToast.success("Plantilla creada");
      qc.invalidateQueries({ queryKey: assessmentsKeys.templates(undefined) });
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: string; body: TemplateRequest }) =>
      updateTemplate(id, body),
    onSuccess: (_, vars) => {
      showToast.success("Plantilla actualizada");
      qc.invalidateQueries({ queryKey: assessmentsKeys.template(vars.id) });
      qc.invalidateQueries({ queryKey: assessmentsKeys.templates(undefined) });
    },
  });

  return { createM, updateM };
}

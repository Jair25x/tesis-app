import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../utils/showToast";
import { useCurriculumFullQuery } from "../../hooks/useCurriculumFullQuery";
import { getCurriculumFull } from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";

function readCurriculumId(): string | null {
  try {
    const v = localStorage.getItem("app:curriculumId");
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}

function findPathByObjectiveId(
  tree: CurriculumFullResponse,
  objectiveId: string
): { competencyId: string; standardId: string } | null {
  for (const comp of tree.competencies ?? []) {
    for (const std of comp.standards ?? []) {
      if ((std.learningObjectives ?? []).some((lo) => lo.id === objectiveId)) {
        return { competencyId: comp.id, standardId: std.id };
      }
    }
  }
  return null;
}

export function useExerciseDeepLink() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const curriculumId = readCurriculumId();
  // Carga (o mantiene cache) del árbol completo vía tu hook
  const { data: tree } = useCurriculumFullQuery(curriculumId ?? "");

  const goToExercise = useCallback(
    async (exerciseId: string, objectiveId: string | null) => {
      if (!exerciseId) {
        showToast.warning("Falta exerciseId para abrir el ejercicio.");
        return;
      }
      if (!objectiveId) {
        showToast.warning("La recomendación no incluye objectiveId.");
        return;
      }
      if (!curriculumId) {
        showToast.warning("Selecciona un currículo antes de abrir ejercicios.");
        return;
      }

      // Asegura que el árbol esté en caché (prefetch si hace falta)
      let treeData = tree;
      if (!treeData) {
        await qc.prefetchQuery({
          queryKey: ["curriculumFull", curriculumId],
          queryFn: () => getCurriculumFull(curriculumId),
        });
        treeData = qc.getQueryData<CurriculumFullResponse>([
          "curriculumFull",
          curriculumId,
        ]);
      }

      if (!treeData) {
        showToast.warning("No se pudo cargar el currículo para resolver la ruta.");
        return;
      }

      const path = findPathByObjectiveId(treeData, objectiveId);
      if (!path) {
        showToast.warning("No se encontró el objetivo en el currículo activo.");
        return;
      }

      navigate(
        `/student/exercises/${curriculumId}/${path.competencyId}/${path.standardId}/${objectiveId}/${exerciseId}`
      );
    },
    [navigate, qc, curriculumId, tree]
  );

  return { goToExercise };
}

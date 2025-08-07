import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSolutionStep,
  getSolutionStepById,
  updateSolutionStep,
} from "../../../services/solutionStepService";
import type { SolutionStepRequest } from "../../../types/exercise/SolutionStepResponse";
import { showToast } from "../../../utils/showToast";

export default function SolutionStepForm() {
  const navigate = useNavigate();
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    solutionStepId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
    solutionStepId?: string;
  }>();

  const isEditMode = Boolean(solutionStepId);

  const [form, setForm] = useState<SolutionStepRequest>({
    stepNumber: 1,
    explanation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      isEditMode &&
      curriculumId &&
      competencyId &&
      standardId &&
      learningObjectiveId &&
      exerciseId &&
      solutionStepId
    ) {
      setLoading(true);
      getSolutionStepById(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        solutionStepId
      )
        .then((data) => {
          setForm({
            stepNumber: data.stepNumber,
            explanation: data.explanation,
          });
        })
        .catch(() => setError("No se pudo cargar el paso de solución."))
        .finally(() => setLoading(false));
    }
  }, [
    isEditMode,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    solutionStepId,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "stepNumber" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId
    )
      return;

    setLoading(true);
    setError("");

    try {
      if (isEditMode && solutionStepId) {
        await updateSolutionStep(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          solutionStepId,
          form
        );
        showToast.success("Paso de solución actualizado correctamente.");
      } else {
        await createSolutionStep(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          form
        );
        showToast.success("Paso de solución creado exitosamente.");
      }

      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`
      );
    } catch {
      showToast.error("Ocurrió un error al guardar el paso de solución.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {isEditMode ? "Editar Paso de Solución" : "Nuevo Paso de Solución"}
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-200 text-red-800 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Número del paso */}
        <div>
          <label
            htmlFor="stepNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Número de paso
          </label>
          <input
            id="stepNumber"
            name="stepNumber"
            type="number"
            min={1}
            required
            value={form.stepNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Explicación */}
        <div>
          <label
            htmlFor="explanation"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Explicación del paso
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={4}
            maxLength={3000}
            value={form.explanation}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md resize-none text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-50 text-sm"
          >
            {loading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Paso"
              : "Crear Paso"}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`
              )
            }
            className="text-sm text-gray-600 dark:text-gray-300 underline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

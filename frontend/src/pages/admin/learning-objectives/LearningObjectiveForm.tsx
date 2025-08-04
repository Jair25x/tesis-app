import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createLearningObjective,
  getLearningObjectiveById,
  updateLearningObjective,
} from "../../../services/learningObjectiveService";
import type { LearningObjectiveRequest } from "../../../types/curriculum/LearningObjectiveResponse";
import { showToast } from "../../../utils/showToast";
import { useLearningObjective } from "../../../context/useLearningObjective";

export default function LearningObjectiveForm() {
  const navigate = useNavigate();
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();

  const { refreshLearningObjectives } = useLearningObjective(); // ✅ Contexto

  const isEditMode = Boolean(learningObjectiveId);

  const [form, setForm] = useState<LearningObjectiveRequest>({
    name: "",
    description: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!curriculumId || !competencyId || !standardId) return;

    if (isEditMode && learningObjectiveId) {
      setLoading(true);
      getLearningObjectiveById(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId
      )
        .then((response) => {
          setForm({
            name: response.name,
            description: response.description,
            code: response.code,
          });
        })
        .catch(() => setError("No se pudo cargar el objetivo para editar."))
        .finally(() => setLoading(false));
    }
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!curriculumId || !competencyId || !standardId)
        throw new Error("IDs jerárquicos incompletos.");

      if (isEditMode && learningObjectiveId) {
        await updateLearningObjective(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          form
        );
        showToast.success("Objetivo actualizado correctamente.");
      } else {
        await createLearningObjective(
          curriculumId,
          competencyId,
          standardId,
          form
        );
        showToast.success("Objetivo creado exitosamente.");
      }

      await refreshLearningObjectives(curriculumId, competencyId, standardId);
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`
      );
    } catch {
      showToast.error("Ocurrió un error al guardar el objetivo.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode
          ? "Editar Objetivo de Aprendizaje"
          : "Nuevo Objetivo de Aprendizaje"}
      </h1>

      {error && (
        <div
          className="bg-red-100 text-red-800 p-4 rounded mb-4 dark:bg-red-200 dark:text-red-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={255}
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            required
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md resize-none text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Código */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Código
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={50}
            value={form.code}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-50 text-sm"
          >
            {loading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Objetivo"
              : "Crear Objetivo"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`
              )
            }
            className="text-gray-700 dark:text-gray-300 underline text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

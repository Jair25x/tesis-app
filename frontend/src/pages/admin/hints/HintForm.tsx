import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createHint,
  getHintById,
  updateHint,
} from "../../../services/hintService";
import type { HintRequest } from "../../../types/exercise/HintResponse";
import { showToast } from "../../../utils/showToast";

export default function HintForm() {
  const navigate = useNavigate();
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    hintId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
    hintId?: string;
  }>();

  const isEditMode = Boolean(hintId);

  const [form, setForm] = useState<HintRequest>({
    hintText: "",
    cost: 0,
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
      hintId
    ) {
      setLoading(true);
      getHintById(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        hintId
      )
        .then((data) => {
          setForm({
            hintText: data.hintText,
            cost: data.cost,
          });
        })
        .catch(() => setError("No se pudo cargar la pista seleccionada."))
        .finally(() => setLoading(false));
    }
  }, [
    isEditMode,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    hintId,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "cost" ? Number(value) : value,
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
      if (isEditMode && hintId) {
        await updateHint(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          hintId,
          form
        );
        showToast.success("Pista actualizada correctamente.");
      } else {
        await createHint(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          form
        );
        showToast.success("Pista creada exitosamente.");
      }

      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`
      );
    } catch {
      showToast.error("Ocurrió un error al guardar la pista.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {isEditMode ? "Editar Pista" : "Nueva Pista"}
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-200 text-red-800 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Texto de la pista */}
        <div>
          <label
            htmlFor="hintText"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Texto de la pista
          </label>
          <textarea
            id="hintText"
            name="hintText"
            value={form.hintText}
            onChange={handleChange}
            rows={4}
            required
            maxLength={2000}
            className="w-full px-4 py-2 border rounded-md resize-none text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Costo */}
        <div>
          <label
            htmlFor="cost"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Costo (puntos)
          </label>
          <input
            id="cost"
            name="cost"
            type="number"
            min={0}
            required
            value={form.cost}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
              ? "Actualizar Pista"
              : "Crear Pista"}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`
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

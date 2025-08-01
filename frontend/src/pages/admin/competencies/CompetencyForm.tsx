import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCompetency,
  getCompetencyById,
  updateCompetency,
} from "../../../services/competencyService";
import type { CompetencyRequest } from "../../../types/curriculum/Competency";
import { showToast } from "../../../utils/showToast";
import { useCompetency } from "../../../context/useCompetency";

export default function CompetencyForm() {
  const navigate = useNavigate();
  const { curriculumId, competencyId } = useParams<{
    curriculumId: string;
    competencyId: string;
  }>();

  const { refreshCompetencies } = useCompetency(); // ✅ Contexto

  const isEditMode = Boolean(competencyId);

  const [form, setForm] = useState<CompetencyRequest>({
    name: "",
    description: "",
    code: "",
    curriculumId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!curriculumId) return;

    if (isEditMode && competencyId) {
      setLoading(true);
      getCompetencyById(curriculumId, competencyId)
        .then((response) => {
          setForm({
            name: response.name,
            description: response.description,
            code: response.code,
            curriculumId: response.curriculumId,
          });
        })
        .catch(() => setError("No se pudo cargar la competencia para editar."))
        .finally(() => setLoading(false));
    } else {
      setForm((prev) => ({ ...prev, curriculumId }));
    }
  }, [curriculumId, competencyId, isEditMode]);

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
      if (!curriculumId) throw new Error("ID de currículo no disponible.");

      if (isEditMode && competencyId) {
        await updateCompetency(curriculumId, competencyId, form);
        showToast.success("Competencia actualizada correctamente.");
      } else {
        await createCompetency(curriculumId, form);
        showToast.success("Competencia creada exitosamente.");
      }

      await refreshCompetencies(curriculumId); // ✅ sincroniza contexto
      navigate(`/admin/curricula/${curriculumId}/competencies`);
    } catch {
      showToast.error("Ocurrió un error al guardar la competencia.");
      setError("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? "Editar Competencia" : "Nueva Competencia"}
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
              ? "Actualizar Competencia"
              : "Crear Competencia"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/curricula/${curriculumId}/competencies`)
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

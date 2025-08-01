import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createStandard,
  getStandardById,
  updateStandard,
} from "../../../services/standardService";
import type {
  StandardRequest,
  StandardResponse,
} from "../../../types/curriculum/StandardResponse";
import { showToast } from "../../../utils/showToast";

export default function StandardForm() {
  const navigate = useNavigate();
  const { curriculumId, competencyId, standardId } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId?: string;
  }>();

  const isEditMode = Boolean(standardId);

  const [form, setForm] = useState<StandardRequest>({
    name: "",
    description: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && standardId && curriculumId && competencyId) {
      setLoading(true);
      getStandardById(curriculumId, competencyId, standardId)
        .then((res) => {
          const data = res.data as StandardResponse;
          setForm({
            name: data.name,
            description: data.description,
            code: data.code,
          });
        })
        .catch(() => setError("No se pudo cargar el estándar para edición."))
        .finally(() => setLoading(false));
    }
  }, [standardId, curriculumId, competencyId, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumId || !competencyId) return;

    setLoading(true);
    setError("");

    try {
      if (isEditMode && standardId) {
        await updateStandard(curriculumId, competencyId, standardId, form);
        showToast.success("Estándar actualizado correctamente.");
      } else {
        await createStandard(curriculumId, competencyId, form);
        showToast.success("Estándar creado exitosamente.");
      }
      navigate(`/admin/curricula/${curriculumId}/competencies/${competencyId}`);
    } catch {
      showToast.error("Ocurrió un error al guardar el estándar.");
      setError("No se pudo guardar el estándar. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center sm:text-left">
        {isEditMode ? "Editar Estándar" : "Nuevo Estándar"}
      </h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 dark:bg-red-200 dark:text-red-900 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            required
            maxLength={255}
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            name="description"
            rows={3}
            maxLength={1000}
            required
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
          />
        </div>

        {/* Código */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Código
          </label>
          <input
            type="text"
            name="code"
            required
            maxLength={50}
            value={form.code}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 text-sm"
          >
            {loading ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/curricula/${curriculumId}/competencies/${competencyId}`
              )
            }
            className="text-gray-700 dark:text-gray-300 underline text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

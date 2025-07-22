import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCurriculum,
  getCurriculumById,
  updateCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumRequest, CurriculumResponse } from "../../../types/Curriculum";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum"; // ✅ Nuevo

export default function CurriculumForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { refreshCurricula } = useCurriculum(); // ✅ Importante

  const [form, setForm] = useState<CurriculumRequest>({
    name: "",
    description: "",
    code: "",
    grade: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getCurriculumById(id)
        .then((res) => {
          const data = res.data as CurriculumResponse;
          setForm({
            name: data.name,
            description: data.description,
            code: data.code,
            grade: data.grade,
          });
        })
        .catch(() => setError("No se pudo cargar el currículo"))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

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
      if (isEditMode && id) {
        await updateCurriculum(id, form);
        showToast.success("Currículo actualizado correctamente.");
      } else {
        await createCurriculum(form);
        showToast.success("Currículo creado exitosamente.");
        await refreshCurricula(); // ✅ Recargar el menú de competencias
      }
      navigate("/admin/curricula");
    } catch {
      showToast.error("Ocurrió un error al guardar el currículo.");
      setError("Ocurrió un error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center sm:text-left">
        {isEditMode ? "Editar Currículo" : "Nuevo Currículo"}
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

        {/* Grado */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Grado
          </label>
          <input
            type="text"
            name="grade"
            required
            maxLength={100}
            value={form.grade}
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
            onClick={() => navigate("/admin/curricula")}
            className="text-gray-700 dark:text-gray-300 underline text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

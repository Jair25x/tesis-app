import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCurricula,
  deleteCurriculum,
  reactivateCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumResponse } from "../../../types/Curriculum";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, Pencil, Eye, RotateCcw } from "lucide-react";
import { cn } from "../../../utils/cn";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum"; // ✅ NUEVO

export default function CurriculumList() {
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { refreshCurricula } = useCurriculum(); // ✅ importante para sincronizar menú

  useEffect(() => {
    loadCurricula();
  }, [filter]);

  const loadCurricula = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getAllCurricula(filter);
      setCurricula(
        data.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))
      );
    } catch (err) {
      console.error("Error al cargar currículos:", err);
      setError("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id: string, action: "delete" | "reactivate") => {
    setSelectedId(id);
    setModalAction(action);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedId || !modalAction) return;
    try {
      setModalLoading(true);

      if (modalAction === "delete") {
        await deleteCurriculum(selectedId);
        showToast.success("Currículo desactivado correctamente.");
      } else {
        await reactivateCurriculum(selectedId);
        showToast.success("Currículo reactivado correctamente.");
      }

      await loadCurricula(); // ✅ actualiza la tabla local
      await refreshCurricula(); // ✅ actualiza el menú de competencias
    } catch (error) {
      console.error("Error ejecutando la acción:", error);
      showToast.error("Ocurrió un error al realizar la acción.");
    } finally {
      setModalLoading(false);
      setSelectedId(null);
      setModalAction(null);
      setShowModal(false);
    }
  };

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-center sm:text-left w-full sm:w-auto">
          Gestión de Currículos
        </h1>
        <Link to="/admin/curricula/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">➕ Nuevo Currículo</Button>
        </Link>
      </div>

      {/* Filtro de estado */}
      <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-3 py-1 rounded text-sm transition",
              filter === type
                ? {
                    all: "bg-blue-600 text-white",
                    active: "bg-green-600 text-white",
                    inactive: "bg-red-600 text-white",
                  }[type]
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {type === "all"
              ? "Todos"
              : type === "active"
              ? "Activos"
              : "Inactivos"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : curricula.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay currículos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="text-left p-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Grado
                </th>
                <th className="text-left p-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Fecha de creación
                </th>
                <th className="text-left p-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="text-center p-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {curricula.map((curriculum) => (
                <tr
                  key={curriculum.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 text-sm text-gray-900 dark:text-gray-100">
                    {curriculum.name}
                  </td>
                  <td className="p-3 text-sm text-gray-900 dark:text-gray-100">
                    {curriculum.grade}
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(curriculum.createdAt)}
                  </td>
                  <td className="p-3 text-sm">
                    {curriculum.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-center space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row justify-center items-center">
                    <Link to={`/admin/curricula/${curriculum.id}/details`}>
                      <Eye className="inline h-5 w-5 text-blue-500 hover:text-blue-600" />
                    </Link>
                    <Link to={`/admin/curricula/${curriculum.id}/edit`}>
                      <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                    </Link>
                    {curriculum.active ? (
                      <button
                        onClick={() => openModal(curriculum.id!, "delete")}
                      >
                        <Trash2 className="inline h-5 w-5 text-red-500 hover:text-red-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(curriculum.id!, "reactivate")}
                      >
                        <RotateCcw className="inline h-5 w-5 text-green-500 hover:text-green-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title={
          modalAction === "delete"
            ? "Desactivar Currículo"
            : "Reactivar Currículo"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar este currículo? Esta acción no eliminará los datos permanentemente."
            : "¿Estás seguro de que deseas reactivar este currículo? Volverá a estar disponible para su uso."
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}

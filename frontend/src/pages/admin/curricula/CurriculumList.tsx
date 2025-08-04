import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCurricula,
  deleteCurriculum,
  reactivateCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, Pencil, Eye, RotateCcw } from "lucide-react";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";

export default function CurriculumList() {
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { refreshCurricula } = useCurriculum();

  useEffect(() => {
    loadCurricula();
  }, [filter]);

  const loadCurricula = async () => {
    try {
      setLoading(true);
      const data = await getAllCurricula(filter);
      setCurricula(data);
    } catch {
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
    setModalLoading(true);
    try {
      if (modalAction === "delete") {
        await deleteCurriculum(selectedId);
        showToast.success("Currículo desactivado correctamente.");
      } else {
        await reactivateCurriculum(selectedId);
        showToast.success("Currículo reactivado correctamente.");
      }
      await loadCurricula();
      await refreshCurricula();
    } catch {
      showToast.error("Error al procesar la acción.");
    } finally {
      setModalLoading(false);
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

      {/* Filtros */}
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

      {/* Tabla */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : curricula.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay currículos disponibles.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Grado
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Creación
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
                <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Competencias
                </th>
              </tr>
            </thead>
            <tbody>
              {curricula.map((curr) => (
                <tr
                  key={curr.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3">{curr.name}</td>
                  <td className="p-3">{curr.grade}</td>
                  <td className="p-3 text-gray-500">
                    {formatDate(curr.createdAt)}
                  </td>
                  <td className="p-3">
                    {curr.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <Link
                      to={`/admin/curricula/${curr.id}/details`}
                      aria-label="Ver detalles"
                    >
                      <Eye className="inline h-5 w-5 text-blue-500 hover:text-blue-600" />
                    </Link>
                    <Link
                      to={`/admin/curricula/${curr.id}/edit`}
                      aria-label="Editar"
                    >
                      <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                    </Link>
                    {curr.active ? (
                      <button
                        onClick={() => openModal(curr.id, "delete")}
                        aria-label="Desactivar"
                      >
                        <Trash2 className="inline h-5 w-5 text-red-500 hover:text-red-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(curr.id, "reactivate")}
                        aria-label="Reactivar"
                      >
                        <RotateCcw className="inline h-5 w-5 text-green-500 hover:text-green-600" />
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/admin/curricula/${curr.id}/competencies`}
                      className="text-sm text-blue-600 hover:underline"
                      aria-label="Ver competencias"
                    >
                      Ver
                    </Link>
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
            ? "¿Estás seguro de que deseas desactivar este currículo?"
            : "¿Deseas reactivarlo?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}

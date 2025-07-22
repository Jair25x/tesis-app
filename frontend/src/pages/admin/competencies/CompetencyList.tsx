import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteCompetency,
  reactivateCompetency,
} from "../../../services/competencyService";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, Pencil, Eye, RotateCcw } from "lucide-react";
import { cn } from "../../../utils/cn";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCompetency } from "../../../context/useCompetency";

export default function CompetencyList() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const {
    competencies,
    status,
    setStatus,
    loading,
    error,
    refreshCompetencies,
  } = useCompetency();

  useEffect(() => {
    if (curriculumId) {
      refreshCompetencies(curriculumId); // ✅ Evita el error
    }
  }, [status, curriculumId]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const openModal = (id: string, action: "delete" | "reactivate") => {
    setSelectedId(id);
    setModalAction(action);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedId || !modalAction || !curriculumId) return;
    try {
      setModalLoading(true);
      if (modalAction === "delete") {
        await deleteCompetency(curriculumId, selectedId);
        showToast.success("Competencia desactivada correctamente.");
      } else {
        await reactivateCompetency(curriculumId, selectedId);
        showToast.success("Competencia reactivada correctamente.");
      }
      await refreshCompetencies(curriculumId); // ✅ recarga desde el contexto
    } catch (err) {
      console.error("Error ejecutando la acción:", err);
      showToast.error("Ocurrió un error al realizar la acción.");
    } finally {
      setModalLoading(false);
      setSelectedId(null);
      setModalAction(null);
      setShowModal(false);
    }
  };

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Competencias
        </h1>
        <Link to={`/admin/curricula/${curriculumId}/competencies/new`}>
          <Button>➕ Nueva Competencia</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setStatus(type)}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium",
              status === type
                ? {
                    all: "bg-blue-600 text-white",
                    active: "bg-green-600 text-white",
                    inactive: "bg-red-600 text-white",
                  }[type]
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            )}
            aria-label={`Filtrar por ${type}`}
          >
            {type === "all"
              ? "Todas"
              : type === "active"
              ? "Activas"
              : "Inactivas"}
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
      ) : competencies.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay competencias para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Código
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Fecha de creación
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((competency) => (
                <tr
                  key={competency.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 text-gray-900 dark:text-gray-100">
                    {competency.name}
                  </td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">
                    {competency.code}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(competency.createdAt)}
                  </td>
                  <td className="p-3">
                    {competency.active ? (
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
                      to={`/admin/curricula/${curriculumId}/competencies/${competency.id}/details`}
                      aria-label="Ver detalles"
                    >
                      <Eye className="inline h-5 w-5 text-blue-500 hover:text-blue-600" />
                    </Link>
                    <Link
                      to={`/admin/curricula/${curriculumId}/competencies/${competency.id}/edit`}
                      aria-label="Editar competencia"
                    >
                      <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                    </Link>
                    {competency.active ? (
                      <button
                        onClick={() => openModal(competency.id!, "delete")}
                        aria-label="Desactivar competencia"
                      >
                        <Trash2 className="inline h-5 w-5 text-red-500 hover:text-red-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(competency.id!, "reactivate")}
                        aria-label="Reactivar competencia"
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title={
          modalAction === "delete"
            ? "Desactivar Competencia"
            : "Reactivar Competencia"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar esta competencia? Esto desactivará también sus estándares y objetivos."
            : "¿Estás seguro de que deseas reactivar esta competencia? Volverá a estar disponible junto con sus estándares y objetivos."
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteCompetency,
  reactivateCompetency,
} from "../../../services/competencyService";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, Pencil, Eye, RotateCcw, LayoutList } from "lucide-react";
import { cn } from "../../../utils/cn";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCompetency } from "../../../context/useCompetency";
import BackLink from "../../../components/ui/BackLink";

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

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (curriculumId) refreshCompetencies(curriculumId);
  }, [status, curriculumId]);

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
      await refreshCompetencies(curriculumId);
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
    <section className="p-4 sm:p-6 md:p-8">
      <BackLink to="/admin/curricula" label="Volver al listado de Currículos" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-center sm:text-left w-full sm:w-auto">
          Gestión de Competencias
        </h1>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/new`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">➕ Nueva Competencia</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setStatus(type)}
            className={cn(
              "px-3 py-1 rounded text-sm transition",
              status === type
                ? {
                    all: "bg-blue-600 text-white",
                    active: "bg-green-600 text-white",
                    inactive: "bg-red-600 text-white",
                  }[type]
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {type === "all"
              ? "Todas"
              : type === "active"
              ? "Activas"
              : "Inactivas"}
          </button>
        ))}
      </div>

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
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Código
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Creación
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
              {competencies.map((comp) => (
                <tr
                  key={comp.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3">{comp.name}</td>
                  <td className="p-3">{comp.code}</td>
                  <td className="p-3">{formatDate(comp.createdAt)}</td>
                  <td className="p-3">
                    {comp.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${comp.id}/details`}
                        aria-label="Ver detalles"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                      </Link>
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${comp.id}/edit`}
                        aria-label="Editar"
                        title="Editar competencia"
                      >
                        <Pencil className="h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                      </Link>
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${comp.id}/standards`}
                        aria-label="Ver estándares"
                        title="Ver estándares"
                      >
                        <LayoutList className="h-5 w-5 text-purple-500 hover:text-purple-600" />
                      </Link>
                      {comp.active ? (
                        <button
                          onClick={() => openModal(comp.id, "delete")}
                          aria-label="Desactivar"
                          title="Desactivar"
                        >
                          <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(comp.id, "reactivate")}
                          aria-label="Reactivar"
                          title="Reactivar"
                        >
                          <RotateCcw className="h-5 w-5 text-green-500 hover:text-green-600" />
                        </button>
                      )}
                    </div>
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
            ? "Desactivar Competencia"
            : "Reactivar Competencia"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar esta competencia? También se desactivarán sus estándares y objetivos."
            : "¿Deseas reactivarla junto con sus estándares y objetivos?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}



import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCurricula,
  deleteCurriculum,
  reactivateCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import EntityList from "../../../components/admin/EntityList";
import { formatDate } from "../../../utils/formatDate";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum";

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
      const curricula = await getAllCurricula(filter);
      setCurricula(curricula);
    } catch {
      setError("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId || !modalAction) return;
    setModalLoading(true);
    try {
      if (modalAction === "delete") {
        await deleteCurriculum(selectedId);
        showToast.success("Currículo desactivado.");
      } else {
        await reactivateCurriculum(selectedId);
        showToast.success("Currículo reactivado.");
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
    <EntityList
      title="Gestión de Currículos"
      addButtonText="Nuevo Currículo"
      onAddClick={() => (window.location.href = "/admin/curricula/new")}
      filter={filter}
      setFilter={setFilter}
      loading={loading}
      error={error}
      emptyMessage="No hay currículos disponibles."
    >
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Nombre", "Grado", "Creación", "Estado", "Acciones"].map(
                (header) => (
                  <th
                    key={header}
                    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {curricula.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.grade}</td>
                <td className="p-3 text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="p-3">
                  {item.active ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Activo
                    </span>
                  ) : (
                    <span className="text-red-500 dark:text-red-400 font-medium">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="p-3 space-x-2 text-center">
                  <Link to={`/admin/curricula/${item.id}/details`}>
                    <Eye className="inline h-5 w-5 text-blue-500" />
                  </Link>
                  <Link to={`/admin/curricula/${item.id}/edit`}>
                    <Pencil className="inline h-5 w-5 text-yellow-500" />
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedId(item.id);
                      setModalAction(item.active ? "delete" : "reactivate");
                      setShowModal(true);
                    }}
                  >
                    {item.active ? (
                      <Trash2 className="inline h-5 w-5 text-red-500" />
                    ) : (
                      <RotateCcw className="inline h-5 w-5 text-green-500" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </EntityList>
  );
}

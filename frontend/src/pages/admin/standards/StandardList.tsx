import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getStandards,
  deleteStandard,
  reactivateStandard,
} from "../../../services/standardService";
import type { StandardResponse } from "../../../types/curriculum/StandardResponse";
import EntityList from "../../../components/admin/EntityList";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";

export default function StandardList() {
  const { curriculumId, competencyId } = useParams();
  const [standards, setStandards] = useState<StandardResponse[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (curriculumId && competencyId) {
      loadStandards();
    }
  }, [filter, curriculumId, competencyId]);

  const loadStandards = async () => {
    try {
      setLoading(true);
      const { data } = await getStandards(
        curriculumId!,
        competencyId!,
        filter
      );
      setStandards(data);
    } catch {
      setError("Ocurrió un error al cargar los estándares.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId || !modalAction) return;
    setModalLoading(true);
    try {
      if (modalAction === "delete") {
        await deleteStandard(curriculumId!, competencyId!, selectedId);
        showToast.success("Estándar desactivado.");
      } else {
        await reactivateStandard(curriculumId!, competencyId!, selectedId);
        showToast.success("Estándar reactivado.");
      }
      await loadStandards();
    } catch {
      showToast.error("Error al procesar la acción.");
    } finally {
      setModalLoading(false);
      setShowModal(false);
    }
  };

  return (
    <EntityList
      title="Gestión de Estándares"
      addButtonText="Nuevo Estándar"
      onAddClick={() =>
        (window.location.href = `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/new`)
      }
      filter={filter}
      setFilter={setFilter}
      loading={loading}
      error={error || ""}
      emptyMessage="No hay estándares disponibles."
    >
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Nombre", "Código", "Creación", "Estado", "Acciones"].map(
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
            {standards.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.code}</td>
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
                  <Link
                    to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${item.id}/details`}
                  >
                    <Eye className="inline h-5 w-5 text-blue-500" />
                  </Link>
                  <Link
                    to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${item.id}/edit`}
                  >
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
            ? "Desactivar Estándar"
            : "Reactivar Estándar"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar este estándar?"
            : "¿Deseas reactivarlo?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </EntityList>
  );
}

import { useParams, Link, useNavigate } from "react-router-dom";
import { useStandard } from "../../../context/useStandard";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import EntityList from "../../../components/admin/EntityList";
import { showToast } from "../../../utils/showToast";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, RotateCcw, Eye, Pencil, BookOpenCheck } from "lucide-react";
import {
  deleteStandard,
  reactivateStandard,
} from "../../../services/standardService";
import { useState } from "react";

export default function StandardList() {
  const { curriculumId, competencyId } = useParams();
  const { standards, status, setStatus, refreshStandards, loading, error } =
    useStandard();
  const navigate = useNavigate();

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
    if (!curriculumId || !competencyId || !selectedId || !modalAction) return;
    setModalLoading(true);
    try {
      if (modalAction === "delete") {
        await deleteStandard(curriculumId, competencyId, selectedId);
        showToast.success("Estándar desactivado correctamente.");
      } else {
        await reactivateStandard(curriculumId, competencyId, selectedId);
        showToast.success("Estándar reactivado correctamente.");
      }
      await refreshStandards(curriculumId, competencyId);
    } catch (err) {
      console.error("Error ejecutando la acción:", err);
      showToast.error("Ocurrió un error al realizar la acción.");
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
        navigate(
          `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/new`
        )
      }
      filter={status}
      setFilter={setStatus}
      loading={loading}
      error={error}
      emptyMessage="No hay estándares registrados."
    >
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Nombre", "Código", "Creación", "Estado", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    className={`p-3 font-semibold text-gray-700 dark:text-gray-300 ${
                      h === "Acciones" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {standards.map((std) => (
              <tr
                key={std.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{std.name}</td>
                <td className="p-3">{std.code}</td>
                <td className="p-3 text-gray-500">
                  {formatDate(std.createdAt)}
                </td>
                <td className="p-3">
                  {std.active ? (
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
                  <div className="flex justify-center gap-2">
                    <TooltipIcon
                      to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${std.id}/details`}
                      label="Ver detalles"
                    >
                      <Eye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                    </TooltipIcon>

                    <TooltipIcon
                      to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${std.id}/edit`}
                      label="Editar estándar"
                    >
                      <Pencil className="h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                    </TooltipIcon>

                    <TooltipIcon
                      to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${std.id}/learning-objectives`}
                      label="Ver objetivos"
                    >
                      <BookOpenCheck className="h-5 w-5 text-purple-500 hover:text-purple-600" />
                    </TooltipIcon>

                    <TooltipButton
                      onClick={() =>
                        openModal(std.id, std.active ? "delete" : "reactivate")
                      }
                      label={std.active ? "Desactivar" : "Reactivar"}
                    >
                      {std.active ? (
                        <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                      ) : (
                        <RotateCcw className="h-5 w-5 text-green-500 hover:text-green-600" />
                      )}
                    </TooltipButton>
                  </div>
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
            ? "¿Estás seguro de que deseas desactivar este estándar? Esto también ocultará sus objetivos relacionados."
            : "¿Deseas reactivarlo? Se restaurará con sus objetivos asociados."
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </EntityList>
  );
}

function TooltipIcon({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative inline-block">
      <Link to={to} className="inline-block">
        {children}
      </Link>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {label}
      </span>
    </div>
  );
}

function TooltipButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative inline-block">
      <button onClick={onClick} className="inline-block">
        {children}
      </button>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {label}
      </span>
    </div>
  );
}

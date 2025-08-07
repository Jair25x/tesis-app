import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCurricula,
  deleteCurriculum,
  reactivateCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import { formatDate } from "../../../utils/formatDate";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { Eye, Pencil, Trash2, RotateCcw, BookOpenCheck } from "lucide-react";

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
    <section className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold dark:text-white text-center md:text-left">
          Gestión de Currículos
        </h1>
        <Link to="/admin/curricula/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">➕ Nuevo Currículo</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2 justify-center md:justify-start">
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

      {/* Loading y errores */}
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
        <>
          {/* Tabla en pantallas medianas o mayores */}
          <div className="hidden md:block overflow-x-auto rounded-md shadow-sm">
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
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <TooltipIcon
                          to={`/admin/curricula/${curr.id}/details`}
                          label="Ver detalles"
                        >
                          <Eye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                        </TooltipIcon>
                        <TooltipIcon
                          to={`/admin/curricula/${curr.id}/edit`}
                          label="Editar currículo"
                        >
                          <Pencil className="h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                        </TooltipIcon>
                        <TooltipButton
                          onClick={() =>
                            openModal(
                              curr.id,
                              curr.active ? "delete" : "reactivate"
                            )
                          }
                          label={curr.active ? "Desactivar" : "Reactivar"}
                        >
                          {curr.active ? (
                            <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                          ) : (
                            <RotateCcw className="h-5 w-5 text-green-500 hover:text-green-600" />
                          )}
                        </TooltipButton>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <TooltipIcon
                        to={`/admin/curricula/${curr.id}/competencies`}
                        label="Ver competencias"
                      >
                        <BookOpenCheck className="h-5 w-5 text-purple-500 hover:text-purple-600" />
                      </TooltipIcon>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <div className="md:hidden flex flex-col gap-4">
            {curricula.map((curr) => (
              <div
                key={curr.id}
                className="border rounded-md p-4 shadow-sm bg-white dark:bg-gray-800"
              >
                <h2 className="text-lg font-semibold dark:text-white">
                  {curr.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grado: {curr.grade}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creado: {formatDate(curr.createdAt)}
                </p>
                <p className="text-sm">
                  Estado:{" "}
                  {curr.active ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Activo
                    </span>
                  ) : (
                    <span className="text-red-500 dark:text-red-400 font-medium">
                      Inactivo
                    </span>
                  )}
                </p>
                <div className="flex justify-start flex-wrap gap-3 mt-3">
                  <TooltipIcon
                    to={`/admin/curricula/${curr.id}/details`}
                    label="Ver detalles"
                  >
                    <Eye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                  </TooltipIcon>
                  <TooltipIcon
                    to={`/admin/curricula/${curr.id}/edit`}
                    label="Editar currículo"
                  >
                    <Pencil className="h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                  </TooltipIcon>
                  <TooltipIcon
                    to={`/admin/curricula/${curr.id}/competencies`}
                    label="Ver competencias"
                  >
                    <BookOpenCheck className="h-5 w-5 text-purple-500 hover:text-purple-600" />
                  </TooltipIcon>
                  <TooltipButton
                    onClick={() =>
                      openModal(curr.id, curr.active ? "delete" : "reactivate")
                    }
                    label={curr.active ? "Desactivar" : "Reactivar"}
                  >
                    {curr.active ? (
                      <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                    ) : (
                      <RotateCcw className="h-5 w-5 text-green-500 hover:text-green-600" />
                    )}
                  </TooltipButton>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
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

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCurriculumById,
  deleteCurriculum,
} from "../../../services/curriculumService";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";
import { useCurriculum } from "../../../hooks/useCurriculum";

export default function CurriculumDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { refreshCurricula } = useCurriculum();

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const data = await getCurriculumById(id || "");
        setCurriculum(data);
      } catch (err) {
        console.error("Error al obtener el currículo:", err);
        setError("No se pudo cargar el currículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!curriculum) return;
    setConfirmLoading(true);
    try {
      await deleteCurriculum(curriculum.id);
      await refreshCurricula(); // ✅ Actualiza menú de competencias
      showToast.success("Currículo desactivado correctamente.");
      navigate("/admin/curricula");
    } catch (err) {
      console.error("Error al desactivar el currículo:", err);
      showToast.error("Ocurrió un error al desactivar el currículo.");
    } finally {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error)
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        <p>{error}</p>
        <Link
          to="/admin/curricula"
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista
        </Link>
      </div>
    );

  if (!curriculum) return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Título y botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">
          Detalles del Currículo
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to={`/admin/curricula/${curriculum.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-center"
          >
            Editar
          </Link>
          {curriculum.active && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-center"
            >
              Desactivar
            </button>
          )}
        </div>
      </div>

      {/* Caja de detalles */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 space-y-4 overflow-x-auto">
        <Detail label="Nombre" value={curriculum.name} />
        <Detail label="Código" value={curriculum.code} />
        <Detail label="Grado" value={curriculum.grade} />
        <Detail label="Descripción" value={curriculum.description || "—"} />
        <Detail
          label="Estado"
          value={
            curriculum.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-600 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(curriculum.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(curriculum.updatedAt)}
        </p>
      </div>

      {/* Enlace para volver */}
      <div className="mt-6">
        <Link
          to="/admin/curricula"
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de currículos
        </Link>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar currículo?"
        description="¿Estás seguro de que deseas desactivar este currículo? Esta acción no eliminará los datos, pero lo ocultará para los usuarios."
        isLoading={confirmLoading}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="break-words">
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {label}:
      </span>{" "}
      <span className="text-gray-800 dark:text-gray-100">{value}</span>
    </p>
  );
}

import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { setUserEnabled } from "../../../services/adminService";
import { useApi } from "../../../hooks/useApi";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import EntityList from "../../../components/admin/EntityList";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { Eye, RotateCcw, Trash2 } from "lucide-react";

export default function UserList() {
  const { users, error, refresh } = useAdminUsers();
  const { execute: toggleEnabledApi } = useApi(setUserEnabled);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedEnabled, setSelectedEnabled] = useState<boolean>(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const openConfirm = (id: number, enabled: boolean) => {
    setSelectedUserId(id);
    setSelectedEnabled(enabled);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmToggle = useCallback(async () => {
    if (selectedUserId === null) return;

    setConfirmLoading(true);
    try {
      await toggleEnabledApi(selectedUserId, !selectedEnabled);
      await refresh();
      showToast.success(
        `Usuario ${selectedEnabled ? "desactivado" : "activado"} correctamente.`
      );
    } catch {
      showToast.error("Ocurrió un error al actualizar el estado del usuario.");
    } finally {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  }, [selectedUserId, selectedEnabled, toggleEnabledApi, refresh]);

  return (
    <EntityList
      title="Gestión de Usuarios"
      addButtonText="Nuevo Usuario"
      onAddClick={() => (window.location.href = "/admin/users/new")}
      loading={false}
      error={error || ""}
      emptyMessage="No hay usuarios disponibles."
      filter={filter}
      setFilter={setFilter}
    >
      <div className="hidden lg:block overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Usuario", "Email", "Roles", "Estado", "Acciones"].map(
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
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.roles.join(", ")}</td>
                <td className="p-3">
                  {u.enabled ? (
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
                  <Link to={`/admin/users/${u.id}`}>
                    <Eye className="inline h-5 w-5 text-blue-500" />
                  </Link>
                  <button onClick={() => openConfirm(u.id, u.enabled)}>
                    {u.enabled ? (
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

      {/* Mobile cards */}
      <div className="lg:hidden space-y-4 mt-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white dark:bg-[#2d3b46] p-4 rounded-xl shadow"
          >
            <div className="text-sm">
              <p className="mb-1">
                <span className="font-medium">Usuario:</span> {u.username}
              </p>
              <p className="mb-1">
                <span className="font-medium">Email:</span> {u.email}
              </p>
              <p className="mb-1">
                <span className="font-medium">Roles:</span> {u.roles.join(", ")}
              </p>
              <p className="mb-2">
                <span className="font-medium">Estado:</span>{" "}
                {u.enabled ? (
                  <span className="text-green-600 font-medium">Activo</span>
                ) : (
                  <span className="text-red-500 font-medium">Inactivo</span>
                )}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Link
                to={`/admin/users/${u.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Editar
              </Link>
              <button
                onClick={() => openConfirm(u.id, u.enabled)}
                className={`px-3 py-1 rounded text-sm ${
                  u.enabled
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {u.enabled ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        isLoading={confirmLoading}
        variant={selectedEnabled ? "danger" : "success"}
        title={selectedEnabled ? "¿Desactivar usuario?" : "¿Activar usuario?"}
        description={
          selectedEnabled
            ? "¿Estás seguro de que deseas desactivar este usuario? Esta acción lo bloqueará temporalmente."
            : "¿Deseas reactivar este usuario?"
        }
      />
    </EntityList>
  );
}

// src/pages/admin/UserList.tsx
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { setUserEnabled } from "../../services/adminService";
import { useApi } from "../../hooks/useApi";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { UserRow } from "./UserRow";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { showToast } from "../../utils/showToast";

export default function UserList() {
  const { users, error, refresh } = useAdminUsers();
  const { execute: toggleEnabledApi } = useApi(setUserEnabled);

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
    } catch (err) {
      console.error(err);
      showToast.error("Ocurrió un error al actualizar el estado del usuario.");
    } finally {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  }, [selectedUserId, selectedEnabled, toggleEnabledApi, refresh]);

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        👥 Gestión de Usuarios
      </h2>

      {/* TABLE para pantallas grandes */}
      <div className="hidden lg:block overflow-x-auto">
        <table
          className="min-w-full bg-white dark:bg-[#2d3b46] rounded-lg shadow-lg"
          role="table"
          aria-label="Lista de usuarios"
        >
          <thead className="bg-gray-100 dark:bg-[#36404a]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} onToggle={openConfirm} />
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS para móviles y tablets */}
      <div className="lg:hidden space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white dark:bg-[#2d3b46] p-4 rounded-xl shadow flex flex-col"
          >
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Usuario:
              </span>
              <span className="font-semibold">{u.username}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Email:
              </span>
              <span>{u.email}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Roles:
              </span>
              <span>{u.roles.join(", ")}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Estado:
              </span>
              <span className={u.enabled ? "text-green-600" : "text-red-600"}>
                {u.enabled ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
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
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
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
    </div>
  );
}

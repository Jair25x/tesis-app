import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, setUserEnabled } from "../../services/adminService";
import type { AdminUserSummary } from "../../types/AdminTypes";

export default function UserList() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error);
  }, []);

  const toggleEnabled = async (id: number, enabled: boolean) => {
    try {
      await setUserEnabled(id, !enabled);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, enabled: !enabled } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-[#2d3b46] rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Roles</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-300 dark:border-gray-700">
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.roles.join(", ")}</td>
                <td className="px-4 py-2">{u.enabled ? "Activo" : "Inactivo"}</td>
                <td className="px-4 py-2 space-x-2">
                  <Link
                    to={`/admin/users/${u.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => toggleEnabled(u.id, u.enabled)}
                    className="text-blue-600 hover:underline"
                  >
                    {u.enabled ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

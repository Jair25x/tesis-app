// src/pages/admin/UserRow.tsx
import { memo } from "react";
import { Link } from "react-router-dom";
import type { AdminUserSummary } from "../../types/AdminTypes";

interface Props {
  user: AdminUserSummary;
  onToggle: (id: number, enabled: boolean) => void;
}

function UserRowComponent({ user, onToggle }: Props) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {/* Usuario */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {user.username}
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {user.email}
      </td>

      {/* Roles */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {user.roles.join(", ")}
      </td>

      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
            user.enabled
              ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
          }`}
        >
          {user.enabled ? "Activo" : "Inactivo"}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <Link
          to={`/admin/users/${user.id}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
          aria-label={`Editar usuario ${user.username}`}
        >
          Editar
        </Link>
        <button
          onClick={() => onToggle(user.id, user.enabled)}
          className={`hover:underline ${
            user.enabled
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
          aria-label={user.enabled ? "Desactivar usuario" : "Activar usuario"}
        >
          {user.enabled ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}

export const UserRow = memo(UserRowComponent);
export default UserRow;

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
    <tr className="border-t border-gray-200 dark:border-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {user.username}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {user.roles.join(", ")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.enabled
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {user.enabled ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
        <Link
          to={`/admin/users/${user.id}`}
          className="text-blue-600 hover:underline"
          aria-label={`Editar usuario ${user.username}`}
        >
          Editar
        </Link>
        <button
          onClick={() => onToggle(user.id, user.enabled)}
          className={`text-sm font-medium ${
            user.enabled
              ? "text-red-600 hover:underline"
              : "text-green-600 hover:underline"
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

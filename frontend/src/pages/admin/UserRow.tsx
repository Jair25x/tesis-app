import { memo } from "react";
import { Link } from "react-router-dom";
import type { AdminUserSummary } from "../../types/AdminTypes";

interface Props {
  user: AdminUserSummary;
  onToggle: (id: number, enabled: boolean) => void;
}

function UserRowComponent({ user, onToggle }: Props) {
  return (
    <tr className="border-t border-gray-300 dark:border-gray-700" role="row">
      <td role="cell" className="px-4 py-2">
        {user.username}
      </td>
      <td role="cell" className="px-4 py-2">
        {user.email}
      </td>
      <td role="cell" className="px-4 py-2">
        {user.roles.join(", ")}
      </td>
      <td role="cell" className="px-4 py-2">
        {user.enabled ? "Activo" : "Inactivo"}
      </td>
      <td role="cell" className="px-4 py-2 space-x-2">
        <Link
          to={`/admin/users/${user.id}`}
          className="text-blue-600 hover:underline"
          aria-label={`Editar usuario ${user.username}`}
        >
          Editar
        </Link>
        <button
          onClick={() => onToggle(user.id, user.enabled)}
          className="text-blue-600 hover:underline"
          aria-label={user.enabled ? "Desactivar usuario" : "Activar usuario"}
          role="button"
        >
          {user.enabled ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}

export const UserRow = memo(UserRowComponent);
export default UserRow;

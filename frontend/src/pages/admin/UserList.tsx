import { useCallback } from "react";
import { setUserEnabled } from "../../services/adminService";
import { useApi } from "../../hooks/useApi";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { UserRow } from "./UserRow";

export default function UserList() {
  const { users, /* loading, */ error, refresh } = useAdminUsers();
  const { execute: toggleEnabledApi } = useApi(setUserEnabled);

  const toggleEnabled = useCallback(
    async (id: number, enabled: boolean) => {
      try {
        await toggleEnabledApi(id, !enabled);
        await refresh();
      } catch (err) {
        console.error(err);
      }
    },
    [toggleEnabledApi, refresh]
  );

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white dark:bg-[#2d3b46] rounded"
          role="table"
          aria-label="Lista de usuarios"
        >
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" className="px-4 py-2 text-left">
                Usuario
              </th>
              <th role="columnheader" className="px-4 py-2 text-left">
                Email
              </th>
              <th role="columnheader" className="px-4 py-2 text-left">
                Roles
              </th>
              <th role="columnheader" className="px-4 py-2 text-left">
                Estado
              </th>
              <th role="columnheader" className="px-4 py-2 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {users.map((u) => (
              <UserRow key={u.id} user={u} onToggle={toggleEnabled} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/hooks/useAdminUsers.ts
import { useState, useEffect, useCallback } from "react";
import { getAllUsers } from "../services/adminService";
import type { AdminUserSummary } from "../types/AdminTypes";
import { useApi } from "./useApi";

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const { execute, isLoading, error } = useApi(getAllUsers);

  const refresh = useCallback(async () => {
    try {
      const data = await execute();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }, [execute]);

  useEffect(() => {
    refresh();
    // Sólo en el montaje inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { users, loading: isLoading, error, refresh };
}

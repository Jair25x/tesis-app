// src/hooks/useUserStats.ts
import { useState, useEffect, useCallback } from "react";
import { getUserStats } from "../services/adminService";
import { useApi } from "./useApi";

export function useUserStats() {
  const { execute, isLoading, error } = useApi(getUserStats);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getUserStats>
  > | null>(null);

  const load = useCallback(async () => {
    const s = await execute();
    setStats(s);
  }, [execute]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, isLoading, error };
}

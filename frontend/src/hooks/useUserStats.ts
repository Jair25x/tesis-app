import { useState, useEffect } from "react";
import { getUserStats } from "../services/adminService";
import { useApi } from "./useApi";

export function useUserStats() {
  const { execute, isLoading, error } = useApi(getUserStats);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getUserStats>> | null>(null);

  useEffect(() => {
    execute().then(setStats).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stats, isLoading, error };
}

// src/hooks/useRoles.ts
import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../services/authService";

export function useRoles() {
  return useQuery({
    queryKey: ["auth", "roles"],
    queryFn: () => getRoles(),
    staleTime: 10 * 60_000,
  });
}

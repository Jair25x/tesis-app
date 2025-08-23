// src/hooks/useMe.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { me, updateMe, changePassword } from "../services/authService";
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
} from "../types/user/ProfileTypes";

const KEY = ["me"];

export function useMe() {
  const qc = useQueryClient();

  const query = useQuery<UserProfile>({
    queryKey: KEY,
    queryFn: me,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount: number, error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  async function saveProfile(dto: UpdateProfileDto) {
    await updateMe(dto);
    await qc.invalidateQueries({ queryKey: KEY });
  }

  async function changeMyPassword(dto: ChangePasswordDto) {
    await changePassword(dto);
  }

  return { ...query, saveProfile, changeMyPassword };
}

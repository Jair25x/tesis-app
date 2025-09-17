// src/context/useStudentView.ts
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";

export const useStudentView = () => {
  const { user, impersonateStudentView, setImpersonateStudentView } = useAuth();

  // roles seguros
  const roles = user?.roles ?? [];
  const isTeacherOrAdmin =
    roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN");

  // Estudiante real o “simulado” (teacher/admin en modo student view)
  const isStudentView = useMemo(
    () =>
      roles.includes("ROLE_STUDENT") ||
      (isTeacherOrAdmin && impersonateStudentView),
    [roles, isTeacherOrAdmin, impersonateStudentView]
  );

  // Toggle estable (sin setter funcional, acorde a tu tipo)
  const toggleStudentView = useCallback(() => {
    setImpersonateStudentView(!impersonateStudentView);
  }, [impersonateStudentView, setImpersonateStudentView]);

  return {
    isStudentView,
    impersonateStudentView,
    setImpersonateStudentView,
    toggleStudentView,
  };
};

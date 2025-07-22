import { useAuth } from "./useAuth";

export const useStudentView = () => {
  const { user, impersonateStudentView, setImpersonateStudentView } = useAuth();

  const isStudentView =
    user?.roles.includes("ROLE_STUDENT") ||
    ((user?.roles.includes("ROLE_TEACHER") ||
      user?.roles.includes("ROLE_ADMIN")) &&
      impersonateStudentView);

  const toggleStudentView = () => {
    setImpersonateStudentView(!impersonateStudentView);
  };

  return {
    isStudentView,
    impersonateStudentView,
    setImpersonateStudentView,
    toggleStudentView,
  };
};

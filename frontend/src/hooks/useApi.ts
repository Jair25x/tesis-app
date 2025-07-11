import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "../context/useAuth";

export function useApi<T, A extends unknown[]>(
  apiCall: (...args: A) => Promise<T>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const execute = async (...args: A): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall(...args);
      return data;
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        await logout();
        navigate("/login");
      }
      setError(axiosError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../services/authService";
import type { TypedAxiosError } from "../types/shared/AxiosError";
import { useAuth } from "../context/useAuth";
import capybaraGif from "../assets/capibaramini-unscreen.gif";

import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthFormWrapper from "../components/auth/AuthFormWrapper";
import AuthSeparator from "../components/auth/AuthSeparator";
import SocialLoginButton from "../components/auth/SocialLoginButton";
import { showToast } from "../utils/showToast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        username: credentials.username.trim(),
        password: credentials.password,
      };

      const data = await loginRequest(payload);

      login(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          nombres: data.nombres,
          apellidos: data.apellidos,
          roles: data.roles,
        },
        data.token,
        data.refreshToken,
        rememberMe
      );
      navigate("/profile-dashboard", { replace: true });
    } catch (err) {
      const axiosError = err as TypedAxiosError;
      setError(
        axiosError.response?.status === 401
          ? "Credenciales inválidas."
          : "Error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 flex-col">
        <img src={capybaraGif} alt="Cargando..." className="w-40 h-40 mb-4" />
        <p className="italic text-center text-sm">Cargando... 🦫</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center text-slate-800 dark:text-slate-100 px-4">
      <AuthFormWrapper title="Ingresar">
        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        <p className="text-center text-sm text-slate-600 dark:text-slate-300 mb-4">
          Los capibaras aman las matemáticas 🦫
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            name="username"
            placeholder="Nombre de usuario"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <div className="space-y-1">
            <AuthInput
              name="password"
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                onClick={() =>
                  showToast.info("Recuperación de contraseña: próximamente.")
                }
              >
                ¿SE TE OLVIDÓ?
              </button>
            </div>
          </div>

          <label className="flex items-center text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Recordarme
          </label>

          <AuthButton disabled={loading} aria-busy={loading}>
            {loading ? "Enviando..." : "INGRESAR"}
          </AuthButton>
        </form>

        <AuthSeparator />
        <SocialLoginButton />

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
          Al iniciar sesión, aceptas nuestros{" "}
          <span className="underline cursor-pointer">Términos</span> y{" "}
          <span className="underline cursor-pointer">Política de privacidad</span>.
        </p>
      </AuthFormWrapper>
    </div>
  );
}

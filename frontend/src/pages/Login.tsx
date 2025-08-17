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
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(credentials);
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

      // Redirección inmediata y segura
      navigate("/profile-dashboard", { replace: true });
    } catch (err) {
      setLoading(false);
      const axiosError = err as TypedAxiosError;
      setError(
        axiosError.response?.status === 401
          ? "Credenciales inválidas."
          : "Error al iniciar sesión."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e2a34] text-white flex-col">
        <img src={capybaraGif} alt="Cargando..." className="w-48 h-48 mb-4" />
        <p className="italic text-center">Cargando... 🦫</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2a34] min-h-screen flex items-center justify-center text-white">
      <AuthFormWrapper title="Ingresar">
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <p className="text-center">Los capibaras aman las matemáticas 🦫</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="username"
            placeholder="Nombre de usuario"
            onChange={handleChange}
          />
          <div className="space-y-1">
            <AuthInput
              name="password"
              type="password"
              placeholder="Contraseña"
              onChange={handleChange}
            />
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-300 hover:underline"
                onClick={() => alert("Funcionalidad pendiente")}
              >
                ¿SE TE OLVIDÓ?
              </button>
            </div>
          </div>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Recordarme
          </label>
          <AuthButton>INGRESAR</AuthButton>
        </form>

        <AuthSeparator />
        <SocialLoginButton />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-300">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-300 hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Al iniciar sesión, aceptas nuestros{" "}
          <span className="underline">Términos</span> y{" "}
          <span className="underline">Política de privacidad</span>.
        </p>
      </AuthFormWrapper>
    </div>
  );
}

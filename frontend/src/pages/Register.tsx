import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import type { TypedAxiosError } from "../types/AxiosError";

import AuthFormWrapper from "../components/auth/AuthFormWrapper";
import AuthInput from "../components/auth/AuthInput";
import AuthSelect from "../components/auth/AuthSelect";
import AuthButton from "../components/auth/AuthButton";
import AuthRedirectNotice from "../components/auth/AuthRedirectNotice";
import AuthError from "../components/auth/AuthError";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    nombres: "",
    apellidos: "",
    role: "ROLE_STUDENT",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({ ...formData, role: [formData.role] });
      alert("¡Registro exitoso!");
      navigate("/login");
    } catch (err) {
      const axiosError = err as TypedAxiosError;
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("Error al registrar. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="bg-[#1e2a34] text-white min-h-screen flex items-center justify-center">
      <AuthFormWrapper title="Crear cuenta">
        {error && <AuthError message={error} />}
        <p className="text-center text-sm text-gray-300 mb-2">
          ¡Únete y empieza a aprender con los capibaras! 🧠🦫
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="nombres"
            placeholder="Nombres"
            required
            onChange={handleChange}
          />
          <AuthInput
            name="apellidos"
            placeholder="Apellidos"
            required
            onChange={handleChange}
          />
          <AuthInput
            name="email"
            placeholder="Correo electrónico"
            type="email"
            required
            onChange={handleChange}
          />
          <AuthInput
            name="username"
            placeholder="Nombre de usuario"
            required
            onChange={handleChange}
          />
          <AuthInput
            name="password"
            placeholder="Contraseña"
            type="password"
            required
            onChange={handleChange}
          />
          <AuthSelect
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: "ROLE_STUDENT", label: "Soy estudiante" },
              { value: "ROLE_TEACHER", label: "Soy docente" },
            ]}
          />
          <AuthButton type="submit">CREAR CUENTA</AuthButton>
        </form>

        <AuthRedirectNotice
          text="¿Ya tienes una cuenta?"
          buttonLabel="Inicia sesión aquí"
          onClick={() => navigate("/login")}
        />
        <p className="text-xs text-gray-400 text-center mt-6">
          Al registrarte, aceptas nuestros{" "}
          <span className="underline">Términos</span> y{" "}
          <span className="underline">Política de privacidad</span>.
        </p>
      </AuthFormWrapper>
    </div>
  );
}

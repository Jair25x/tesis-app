import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import AuthFormWrapper from "../components/auth/AuthFormWrapper";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthError from "../components/auth/AuthError";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const resMessage = await requestPasswordReset(email);
      setMessage(resMessage);
    } catch (err) {
      console.error(err);
      setError("Error al solicitar restablecimiento de contraseña.");
    }
  };

  return (
    <div className="bg-[#1e2a34] min-h-screen flex items-center justify-center text-white">
      <AuthFormWrapper title="Restablecer contraseña">
        {error && <AuthError message={error} />}
        {message && (
          <p className="text-green-400 text-sm text-center">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthButton>Enviar enlace</AuthButton>
        </form>
        <p className="space-y-4 text-gray-300">
          <Link to="/Login" className="space-y-4 text-blue-500 hover:underline">
            Volver al inicio de sesion
          </Link>
        </p>
      </AuthFormWrapper>
    </div>
  );
}

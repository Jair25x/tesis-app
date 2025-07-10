import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import AuthFormWrapper from "../components/auth/AuthFormWrapper";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthError from "../components/auth/AuthError";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setMessage("");
    try {
      const resMessage = await resetPassword(token, password);
      setMessage(resMessage);
    } catch (err) {
      console.error(err);
      setError("Error al restablecer contraseña.");
    }
  };

  return (
    <div className="bg-[#1e2a34] min-h-screen flex items-center justify-center text-white">
      <AuthFormWrapper title="Nueva contraseña">
        {error && <AuthError message={error} />}
        {message && <p className="text-green-400 text-sm text-center">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="password"
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AuthButton>Restablecer</AuthButton>
        </form>
      </AuthFormWrapper>
    </div>
  );
}

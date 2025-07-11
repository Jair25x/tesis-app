import { useState } from "react";
import { changePassword } from "../../services/profileService";
import type { ChangePasswordDto } from "../../types/ProfileTypes";
import { useApi } from "../../hooks/useApi";

export default function ChangePassword() {
  const [form, setForm] = useState<ChangePasswordDto>({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { execute: changePasswordApi /*, isLoading*/ } = useApi(changePassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await changePasswordApi(form);
      setSuccess("✅ Contraseña cambiada correctamente.");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      setError("❌ Error al cambiar la contraseña. Intenta nuevamente.");
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-10 min-h-[calc(100vh-100px)] bg-gray-50 dark:bg-[#1e2a34]">
      <div className="w-full max-w-md bg-white dark:bg-[#2d3b46] p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          🔒 Cambiar Contraseña
        </h1>

        {success && (
          <p className="text-green-600 bg-green-100 dark:bg-green-700 dark:text-white text-sm px-3 py-2 rounded mb-4">
            {success}
          </p>
        )}
        {error && (
          <p className="text-red-600 bg-red-100 dark:bg-red-700 dark:text-white text-sm px-3 py-2 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="currentPassword"
            type="password"
            placeholder="Contraseña actual"
            value={form.currentPassword}
            onChange={handleChange}
            className="p-3 rounded border dark:border-white/20 bg-gray-50 dark:bg-white/10 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70"
          />
          <input
            name="newPassword"
            type="password"
            placeholder="Nueva contraseña"
            value={form.newPassword}
            onChange={handleChange}
            className="p-3 rounded border dark:border-white/20 bg-gray-50 dark:bg-white/10 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

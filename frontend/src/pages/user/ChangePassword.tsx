// src/pages/user/ChangePassword.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMe } from "../../hooks/useMe";
import type { ChangePasswordDto } from "../../types/user/ProfileTypes";

type LocalFormState = ChangePasswordDto & {
  confirmPassword: string;
};

const ChangePassword: React.FC = () => {
  const [form, setForm] = useState<LocalFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { changeMyPassword } = useMe();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.currentPassword.trim() || !form.newPassword.trim()) {
      return "Por favor completa todos los campos.";
    }
    if (form.newPassword.length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    }
    if (form.newPassword !== form.confirmPassword) {
      return "La confirmación de la nueva contraseña no coincide.";
    }
    if (form.newPassword === form.currentPassword) {
      return "La nueva contraseña debe ser distinta a la actual.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload: ChangePasswordDto = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      };
      await changeMyPassword(payload);
      setSuccess("✅ Contraseña cambiada correctamente.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setError(
        "❌ Error al cambiar la contraseña. Verifica tus datos e inténtalo nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-10 dark:bg-[#1e2a34]">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#2d3b46] sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-white">
            🔒 Cambiar contraseña
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-300 sm:text-sm">
            Por seguridad, usa una contraseña nueva que recuerdes bien y no
            compartas con nadie.
          </p>
        </header>

        {success && (
          <div
            className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-700 dark:bg-green-800/40 dark:text-green-100 sm:text-sm"
            role="status"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-100 sm:text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Ingresa tu contraseña actual"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder-white/60"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder-white/60"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              Recomendación: combina letras mayúsculas, minúsculas y números.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite la nueva contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder-white/60"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

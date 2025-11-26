// src/pages/user/EditProfile.tsx
import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { UpdateProfileDto } from "../../types/user/ProfileTypes";
import { useMe } from "../../hooks/useMe";
import { showToast } from "../../utils/showToast";

const EditProfile: React.FC = () => {
  const { data: me, isLoading, error, saveProfile } = useMe();

  const [form, setForm] = useState<UpdateProfileDto>({
    nombres: "",
    apellidos: "",
    email: "",
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (me) {
      setForm({
        nombres: me.nombres,
        apellidos: me.apellidos,
        email: me.email,
      });
    }
  }, [me]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveProfile(form);
      showToast.success("✅ Perfil actualizado con éxito");
      // Si quieres volver a la vista de perfil:
      // navigate("/settings/profile");
      // De momento, mantenemos la ruta actual por si ya la usas.
      navigate("/settings/edit-profile");
    } catch (err) {
      console.error(err);
      showToast.error("⚠️ Error al actualizar perfil");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-gray-500 dark:text-gray-300">Cargando perfil…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-10 text-center text-red-500">
        Error al cargar el perfil.
      </p>
    );
  }

  if (!me) {
    return (
      <p className="mt-10 text-center text-red-500">
        No autorizado o sesión expirada.
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-10 dark:bg-[#1e2a34]">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#2d3b46] sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-white">
            ✏️ Editar perfil
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-300 sm:text-sm">
            Actualiza tus datos personales. Esto no cambia tus permisos ni
            rol(es) en la plataforma.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="nombres"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombres
            </label>
            <input
              id="nombres"
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              autoComplete="given-name"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-[#1e2a34] dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="apellidos"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Apellidos
            </label>
            <input
              id="apellidos"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              autoComplete="family-name"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-[#1e2a34] dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-[#1e2a34] dark:text-white"
              required
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

// src/pages/user/EditProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UpdateProfileDto } from "../../types/user/ProfileTypes";
import { useMe } from "../../hooks/useMe";
import { showToast } from "../../utils/showToast";

export default function EditProfile() {
  const { data: me, isLoading, error, saveProfile } = useMe();
  const [form, setForm] = useState<UpdateProfileDto>({
    nombres: "",
    apellidos: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Pre-cargar el formulario cuando llegue el perfil
  useEffect(() => {
    if (me) {
      setForm({
        nombres: me.nombres,
        apellidos: me.apellidos,
        email: me.email,
      });
    }
  }, [me]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveProfile(form);
      showToast.success("✅ Perfil actualizado con éxito");
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
      <div className="flex items-center justify-center w-full h-[60vh]">
        <p className="text-gray-500 dark:text-gray-300">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error al cargar el perfil.
      </p>
    );
  }

  if (!me) {
    return (
      <p className="text-center mt-10 text-red-500">
        No autorizado o sesión expirada.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-10 min-h-[calc(100vh-100px)] bg-gray-50 dark:bg-[#1e2a34]">
      <div className="w-full max-w-xl bg-white dark:bg-[#2d3b46] p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          ✏️ Editar Perfil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombres
            </label>
            <input
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1e2a34] text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apellidos
            </label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1e2a34] text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1e2a34] text-gray-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-md font-semibold transition"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}

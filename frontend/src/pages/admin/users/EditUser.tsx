// src/pages/admin/users/EditUser.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../../services/adminService";
import type { AdminUpdateUserDto } from "../../../types/user/AdminTypes";
import { useApi } from "../../../hooks/useApi";
import { showToast } from "../../../utils/showToast";

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<AdminUpdateUserDto>({
    nombres: "",
    apellidos: "",
    email: "",
    profilePictureUrl: "",
    preferences: {},
  });

  const [errors, setErrors] = useState<{
    nombres?: string;
    apellidos?: string;
    email?: string;
  }>({});

  const { execute: fetchUser, error } = useApi(getUserById);
  const { execute: saveUser } = useApi(updateUser);

  useEffect(() => {
    if (!id) return;
    fetchUser(Number(id))
      .then((data) => {
        setForm({
          nombres: data?.nombres || "",
          apellidos: data?.apellidos || "",
          email: data?.email || "",
          profilePictureUrl: data?.profilePictureUrl || "",
          preferences: data?.preferences || {},
        });
      })
      .catch((err) => {
        console.error("Error al cargar el usuario:", err);
      });
  }, [id, fetchUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const newErrors: typeof errors = {};
    if (!form.nombres.trim()) newErrors.nombres = "Ingresa los nombres.";
    if (!form.apellidos.trim()) newErrors.apellidos = "Ingresa los apellidos.";
    if (!form.email.trim()) {
      newErrors.email = "Ingresa un email.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email inválido.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await saveUser(Number(id), form);
      showToast.success("Usuario actualizado correctamente.");
      navigate("/admin/users");
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      showToast.error("Ocurrió un error al actualizar el usuario.");
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Editar Usuario
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-800 shadow rounded p-6"
      >
        <div>
          <label
            htmlFor="nombres"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nombres
          </label>
          <input
            id="nombres"
            name="nombres"
            type="text"
            value={form.nombres}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {errors.nombres && (
            <p className="text-sm text-red-600 mt-1" aria-live="polite">
              {errors.nombres}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="apellidos"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            value={form.apellidos}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {errors.apellidos && (
            <p className="text-sm text-red-600 mt-1" aria-live="polite">
              {errors.apellidos}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1" aria-live="polite">
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 rounded border dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </form>
    </section>
  );
}

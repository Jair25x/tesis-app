import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";
import { useApi } from "../hooks/useApi";
import type { UpdateProfileDto, UserProfile } from "../types/ProfileTypes";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const [form, setForm] = useState<UpdateProfileDto>({
    nombres: "",
    apellidos: "",
    email: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { execute: fetchProfile, error: fetchError } = useApi(getProfile);
  const { execute: saveProfile} = useApi(updateProfile);

  useEffect(() => {
    fetchProfile()
      .then((data: UserProfile) =>
        setForm({
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
        })
      )
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile(form);
      alert("✅ Perfil actualizado con éxito");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("⚠️ Error al actualizar perfil");
    }
  };

  if (fetchError)
    return <p className="text-center mt-10 text-red-500">{fetchError}</p>;

  return (
    <div className="flex items-center justify-center px-4 py-10 min-h-[calc(100vh-100px)] bg-gray-50 dark:bg-[#1e2a34]">
      <div className="w-full max-w-xl bg-white dark:bg-[#2d3b46] p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          ✏️ Editar Perfil
        </h1>

        {error && (
          <p className="text-red-500 bg-red-100 dark:bg-red-800/20 p-2 rounded mb-4 text-sm text-center">
            {error}
          </p>
        )}

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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}

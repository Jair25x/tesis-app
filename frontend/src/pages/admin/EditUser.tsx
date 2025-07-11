import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../services/adminService";
import type { AdminUpdateUserDto } from "../../types/AdminTypes";

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<AdminUpdateUserDto>({
    nombres: "",
    apellidos: "",
    email: "",
  });

  useEffect(() => {
    if (!id) return;
    getUserById(Number(id))
      .then((data) => {
        setForm({
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
          profilePictureUrl: data.profilePictureUrl,
          preferences: data.preferences,
        });
      })
      .catch(console.error);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateUser(Number(id), form);
      alert("Usuario actualizado correctamente.");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-[#2d3b46] p-6 rounded">
        <h1 className="text-xl font-bold mb-4 text-center">Editar Usuario</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombres</label>
            <input
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Apellidos</label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

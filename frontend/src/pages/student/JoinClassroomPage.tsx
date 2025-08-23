// src/pages/student/JoinClassroomPage.tsx
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { classroomApi } from "../../services/classroomService";
import { showToast } from "../../utils/showToast";

export default function JoinClassroomPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const joinMu = useMutation({
    mutationFn: () =>
      classroomApi.joinByCode({ code: code.trim().toUpperCase() }),
    onSuccess: () => {
      showToast.success("¡Te uniste al aula!");
      navigate("/student/classrooms");
    },
    onError: (err: unknown) => {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 404) {
        showToast.error("Código inválido o expirado.");
      } else if (status === 409) {
        showToast.error("El código está agotado (sin usos disponibles).");
      } else {
        showToast.error("No se pudo unir al aula.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[A-Z0-9]{6,12}$/.test(code.trim().toUpperCase())) {
      showToast.info("El código debe ser alfanumérico (6-12) en MAYÚSCULAS.");
      return;
    }
    joinMu.mutate();
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Unirme a un aula</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block">Código de ingreso</span>
          <input
            type="text"
            inputMode="text"
            pattern="^[A-Z0-9]{6,12}$"
            title="Solo mayúsculas y números (6-12)"
            className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="p.ej., ABCD23"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </label>

        <button
          type="submit"
          disabled={joinMu.isPending}
          className="rounded bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60"
        >
          {joinMu.isPending ? "Uniendo..." : "Unirme"}
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Pide a tu docente el código del aula. Si no funciona, puede que haya
        expirado o alcanzado el límite de usos.
      </p>
    </div>
  );
}

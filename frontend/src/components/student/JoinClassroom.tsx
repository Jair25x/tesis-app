// src/pages/student/JoinClassroom.tsx
import { useState } from "react";
import { useJoinByCode } from "../../hooks/classroom/useMutations";
import { useNavigate } from "react-router-dom";

export default function JoinClassroom() {
  const [code, setCode] = useState("");
  const joinMu = useJoinByCode();
  const navigate = useNavigate();

  const submit = () => {
    joinMu.mutate(
      { code },
      { onSuccess: () => navigate("/student/classrooms") }
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Unirme a un aula</h1>
      <label className="text-sm">
        <span className="block mb-1">Código</span>
        <input
          className="border rounded px-2 py-1 w-full"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
        />
      </label>
      <div className="flex gap-2">
        <button
          className="rounded bg-blue-600 text-white px-3 py-1.5"
          onClick={submit}
          disabled={!code || joinMu.isPending}
        >
          {joinMu.isPending ? "Uniendo..." : "Unirme"}
        </button>
      </div>
    </div>
  );
}

// pages/student/duels/DuelJoin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveCode } from "../../../services/duelsService";
import { useToastError } from "../../../hooks/useToastError";

const CODE_LEN_MIN = 4;
const CODE_LEN_MAX = 12;

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  } catch {
    return null;
  }
}

export default function DuelJoin() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toastError = useToastError(setErr);

  const onChange = (v: string) => {
    const clean = v.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCode(clean.slice(0, CODE_LEN_MAX));
  };

  const canGo = code.length >= CODE_LEN_MIN;

  const go = async () => {
    setErr(null);
    const token = getAccessToken();
    if (!token) {
      toastError("No hay sesión activa.");
      return;
    }
    const looksUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        code
      );
    setBusy(true);
    try {
      if (looksUuid) {
        nav(`/student/duels/${code}`);
        return;
      }
      // Código corto: validar primero
      await resolveCode(code, token);
      nav(`/student/duels/room?code=${encodeURIComponent(code)}`);
    } catch (e) {
      toastError(e, "Código no encontrado.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-3 text-2xl font-bold">🔑 Unirme con código</h1>
      <p className="mb-3 text-sm opacity-80">
        Escribe el código que te compartieron para entrar al duelo.
      </p>

      <label className="mb-1 block text-sm font-medium">Código del duelo</label>
      <input
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !busy && canGo) {
            e.preventDefault();
            void go();
          }
        }}
        inputMode="text"
        autoCapitalize="characters"
        className="mb-2 w-full rounded-md border px-3 py-2 text-lg tracking-widest dark:border-gray-700 dark:bg-gray-900"
        placeholder="ABC123"
        aria-label="Código del duelo"
        disabled={busy}
      />
      <div className="mb-2 text-xs opacity-70">
        Solo letras y números. Ej.: <code>ABC123</code>
      </div>
      {err && (
        <div className="mb-3 text-xs text-rose-600 dark:text-rose-300">
          {err}
        </div>
      )}

      <button
        onClick={go}
        disabled={!canGo || busy}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {busy ? "Validando…" : "Entrar"}
      </button>
    </div>
  );
}

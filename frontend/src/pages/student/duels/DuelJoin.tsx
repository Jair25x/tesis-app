// src/pages/student/duels/DuelJoin.tsx
import React, { useState } from "react";
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

const DuelJoin: React.FC = () => {
  const nav = useNavigate();
  const [code, setCode] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const toastError = useToastError(setErr);

  const onChange = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCode(clean.slice(0, CODE_LEN_MAX));
  };

  const trimmedCode = code.trim();
  const canGo = trimmedCode.length >= CODE_LEN_MIN;

  const handleSubmit = async () => {
    setErr(null);
    const token = getAccessToken();

    if (!token) {
      toastError("No hay sesión activa.");
      return;
    }

    if (!canGo) return;

    const looksUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        trimmedCode
      );

    setBusy(true);
    try {
      if (looksUuid) {
        // Unirse directo por matchId (usado si se comparte el link interno)
        nav(`/student/duels/${trimmedCode}`);
        return;
      }

      // Código corto: validar primero con el backend
      await resolveCode(trimmedCode, token);
      nav(`/student/duels/room?code=${encodeURIComponent(trimmedCode)}`);
    } catch (e) {
      toastError(e, "Código no encontrado.");
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !busy && canGo) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const remainingMin = Math.max(0, CODE_LEN_MIN - trimmedCode.length);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        {/* Encabezado */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              🔑 Unirme a un duelo
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
              Ingresa el código que te compartieron para entrar a la sala del
              duelo.
            </p>
          </div>
          <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 sm:inline">
            Código rápido
          </span>
        </div>

        {/* Campo de código */}
        <div className="mb-3">
          <label
            htmlFor="duel-code"
            className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-100"
          >
            Código del duelo
          </label>
          <input
            id="duel-code"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border px-3 py-2 text-center text-lg tracking-[0.35em] outline-none transition dark:border-gray-700 dark:bg-gray-950 sm:text-2xl"
            placeholder="ABC123"
            aria-label="Código del duelo"
            disabled={busy}
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
            <span>
              Solo letras y números. Ejemplo:{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                ABC123
              </code>
            </span>
            <span>
              {trimmedCode.length > 0
                ? `${trimmedCode.length}/${CODE_LEN_MAX} caracteres`
                : `Mínimo ${CODE_LEN_MIN} caracteres`}
            </span>
          </div>
          {remainingMin > 0 && trimmedCode.length > 0 && (
            <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">
              Te faltan {remainingMin} carácter
              {remainingMin > 1 ? "es" : ""} para poder unirte.
            </div>
          )}
        </div>

        {/* Error inline */}
        {err && (
          <div
            className="mb-3 rounded-md border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-100"
            role="alert"
            aria-live="polite"
          >
            {err}
          </div>
        )}

        {/* Tips / ayuda */}
        <div className="mb-4 rounded-lg bg-indigo-50 p-2.5 text-[11px] text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-100 sm:text-xs">
          <ul className="list-inside list-disc space-y-1">
            <li>
              Pídele a tu compañera o docente que te comparta el código del
              duelo.
            </li>
            <li>
              Si recibiste un enlace, también puedes entrar directamente
              haciendo clic en el link.
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => nav("/student/duels/hub")}
            disabled={busy}
            className="w-full rounded-xl border px-4 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 sm:w-auto"
          >
            Volver al Hub
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGo || busy}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {busy ? "Validando…" : "Entrar al duelo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuelJoin;

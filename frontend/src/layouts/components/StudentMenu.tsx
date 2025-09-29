// src/layouts/components/StudentMenu.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMySubmissions } from "../../services/assessmentsService";
import { assessmentsKeys } from "../../hooks/assessments/queryKeys";

interface StudentMenuProps {
  studentOpen: boolean;
  setStudentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

const baseItem =
  "group relative block rounded-md px-3 py-2 text-sm transition outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:hover:bg-gray-800";
const activeItem =
  "bg-emerald-600/15 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-200";

function CountPill({ n }: { n: number }) {
  if (!Number.isFinite(n) || n <= 0) return null;
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/10 dark:text-amber-200">
      {n}
    </span>
  );
}

function getLastSeenSubmittedCount(): number {
  const raw = localStorage.getItem("assess:lastSeenSubmittedCount");
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function StudentMenu({
  studentOpen,
  setStudentOpen,
  setSidebarOpen,
}: StudentMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionActive = location.pathname.startsWith("/student");
  const item = ({ isActive }: { isActive: boolean }) =>
    cn(baseItem, isActive && activeItem);

  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("assess:lastSubmissionId");
    setLastSubmissionId(id);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "assess:lastSubmissionId") {
        setLastSubmissionId(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Pendientes del BE = SUBMITTED (size=1 para obtener totalElements rápido)
  const { data: serverSubmitted = 0 } = useQuery({
    queryKey: assessmentsKeys.mySubmissionsCount("SUBMITTED"),
    queryFn: async () => {
      const page = await listMySubmissions({
        status: "SUBMITTED",
        page: 0,
        size: 1,
      });
      return page.totalElements ?? 0;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const unseen = Math.max(serverSubmitted - getLastSeenSubmittedCount(), 0);

  const onJoin = (e: FormEvent) => {
    e.preventDefault();
    const raw = joinCode.trim();
    if (!raw) return;

    // Normaliza a MAYÚSCULAS y filtra caracteres
    const code = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // UUID v4
    const looksUuid =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(
        code
      );

    setSidebarOpen(false);
    if (looksUuid) {
      navigate(`/student/duels/${code}`);
    } else {
      // Código corto (p.ej. ABC123)
      navigate(`/student/duels/room?code=${encodeURIComponent(code)}`);
    }
  };

  return (
    <div className="relative">
      <button
        aria-expanded={studentOpen}
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500",
          sectionActive ? "bg-green-500 text-white" : ""
        )}
        onClick={() => setStudentOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2">📚 Estudiante</span>
        <span className="ml-2">{studentOpen ? "▴" : "▾"}</span>
      </button>

      {studentOpen && (
        <div className="ml-4 mt-1 space-y-1">
          <NavLink
            to="/student/dashboard"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Dashboard
          </NavLink>

          <NavLink
            to="/student/roadmap"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🗺️ Mapa de estudio
          </NavLink>

          <NavLink
            to="/student/classrooms"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🏫 Mis aulas
          </NavLink>

          <NavLink
            to="/student/join"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            ➕ Unirme a un aula
          </NavLink>

          <NavLink
            to="/student/achievements"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🏆 Logros
          </NavLink>

          <NavLink
            to="/student/ai-advisor"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🤖 Asistente IA
          </NavLink>

          {/* ====== NUEVA SECCIÓN: Duelos ====== */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Duelos
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/student/duels/new"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                ⚔️ Nuevo duelo
              </NavLink>
              <NavLink
                to="/student/duels/join"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                🔑 Unirme con código
              </NavLink>
              {/* Unirme con código (inline, sin página extra) */}
              <form onSubmit={onJoin} className="px-3 pt-1">
                <label className="mb-1 block text-[11px] opacity-70">
                  Unirme con código
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="text"
                    placeholder="matchId o código"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full rounded-md border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                    aria-label="Código de duelo"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700"
                    title="Unirme"
                  >
                    Unirme
                  </button>
                </div>
              </form>
            </nav>
          </div>

          {/* ====== Evaluaciones ====== */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Evaluaciones
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/student/assessments/available"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                📝 Disponibles
              </NavLink>

              <NavLink
                to="/student/assessments/history"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                ✅ Mis resultados
                <CountPill n={unseen} />
              </NavLink>

              {lastSubmissionId && (
                <NavLink
                  to={`/student/assessments/result/${lastSubmissionId}`}
                  className={item}
                  onClick={() => setSidebarOpen(false)}
                >
                  📄 Mi último resultado
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

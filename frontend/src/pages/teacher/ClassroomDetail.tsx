import { useParams } from "react-router-dom";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { useClassroomDetail } from "../../hooks/classroom/useClassroomDetail";
import ClassroomInfoTab from "../../components/teacher/ClassroomInfoTab";
import ClassroomMembersTab from "../../components/teacher/ClassroomMembersTab";
import ClassroomJoinCodeTab from "../../components/teacher/ClassroomJoinCodeTab";
import ClassroomProgressTab from "../../components/teacher/ClassroomProgressTab";
import BackLink from "../../components/ui/BackLink";

type Tab = "info" | "members" | "code" | "progress";

export default function TeacherClassroomDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading } = useClassroomDetail(id);
  const [tab, setTab] = useState<Tab>("info");

  if (isLoading) return <LoadingScreen />;

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full overflow-x-hidden bg-gray-50 px-4 py-6 text-sm text-gray-800 dark:bg-[#1e2a34] dark:text-gray-100 sm:px-6 lg:px-8">
        Aula no encontrada.
      </div>
    );
  }

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "info", label: "Información", emoji: "ℹ️" },
    { key: "members", label: "Miembros", emoji: "👥" },
    { key: "code", label: "Código", emoji: "🔑" },
    { key: "progress", label: "Progreso", emoji: "📈" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] w-full overflow-x-hidden bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <BackLink to="/teacher/classrooms" label="Volver a Mis aulas" />
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
                {data.name}
              </h1>
              {data.description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                  {data.description}
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-300 sm:text-right">
            <div>Código interno:</div>
            <div className="font-mono">{data.id.slice(0, 8)}…</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex flex-1 min-w-[48%] items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition sm:min-w-0 sm:flex-none sm:px-4 sm:text-sm ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la pestaña */}
        <div className="pb-4">
          {tab === "info" && <ClassroomInfoTab classroom={data} />}
          {tab === "members" && <ClassroomMembersTab classroomId={id} />}
          {tab === "code" && <ClassroomJoinCodeTab classroomId={id} />}
          {tab === "progress" && <ClassroomProgressTab classroomId={id} />}
        </div>
      </div>
    </div>
  );
}

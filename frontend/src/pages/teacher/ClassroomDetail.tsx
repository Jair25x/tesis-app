// src/pages/teacher/ClassroomDetail.tsx
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
  if (!data) return <div className="p-4">Aula no encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackLink to="/teacher/classrooms" label="Volver a Mis aulas" />
          <h1 className="text-xl font-semibold">{data.name}</h1>
        </div>
      </div>

      <div className="flex gap-2">
        {(["info", "members", "code", "progress"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded border ${
              tab === t ? "bg-gray-100 dark:bg-gray-700" : ""
            }`}
          >
            {t === "info"
              ? "Info"
              : t === "members"
              ? "Miembros"
              : t === "code"
              ? "Código"
              : "Progreso"}
          </button>
        ))}
      </div>

      {tab === "info" && <ClassroomInfoTab classroom={data} />}
      {tab === "members" && <ClassroomMembersTab classroomId={id} />}
      {tab === "code" && <ClassroomJoinCodeTab classroomId={id} />}
      {tab === "progress" && <ClassroomProgressTab classroomId={id} />}
    </div>
  );
}

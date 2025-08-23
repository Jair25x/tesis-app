// src/pages/student/MyClassrooms.tsx
import LoadingScreen from "../../components/LoadingScreen";
import { useClassroomsEnrolled } from "../../hooks/classroom/useClassroomsEnrolled";
import { Link } from "react-router-dom";

export default function MyClassrooms() {
  const { data, isLoading } = useClassroomsEnrolled();
  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis aulas</h1>
        <Link
          to="/student/join"
          className="rounded bg-blue-600 text-white px-3 py-1.5"
        >
          Unirme por código
        </Link>
      </div>

      {data?.length ? (
        <ul className="grid gap-3">
          {data.map((c) => (
            <li key={c.id} className="border rounded p-3 dark:border-gray-700">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-500">
                {c.membersCount} miembros
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">
          Aún no estás en ninguna aula.
        </div>
      )}
    </div>
  );
}

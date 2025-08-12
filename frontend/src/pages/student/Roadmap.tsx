// src/pages/student/Roadmap.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getCurriculumFull } from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressNode from "../../components/student/ProgressNode";

type LOWithStandard = {
  id: string;
  name: string;
  standardId: string;
};

export default function Roadmap() {
  const { id: curriculumId } = useParams<{ id: string }>();
  const [curriculum, setCurriculum] = useState<CurriculumFullResponse | null>(
    null
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!curriculumId) {
      setError("No se encontró el currículo.");
      return;
    }
    (async () => {
      try {
        const data = await getCurriculumFull(curriculumId);
        setCurriculum(data);
      } catch (e) {
        console.error("Error al cargar el currículo:", e);
        setError("Error al cargar el currículo.");
      }
    })();
  }, [curriculumId]);

  // Placeholders (conectar luego a ai-advisor-service y progress-service)
  const recommendedIds = useMemo<Set<string>>(() => new Set(), []);
  const completedIds = useMemo<Set<string>>(() => new Set(), []);

  const byCompetency = useMemo(() => {
    if (!curriculum) return [];
    return curriculum.competencies.map((comp) => {
      const objectives: LOWithStandard[] = comp.standards.flatMap((std) =>
        std.learningObjectives.map((lo) => ({
          id: lo.id,
          name: lo.name,
          standardId: std.id,
        }))
      );

      const recommended = objectives.filter((o) => recommendedIds.has(o.id));
      const completed = objectives.filter((o) => completedIds.has(o.id));
      const available = objectives.filter((o) => !completedIds.has(o.id));
      const availableMinusRecommended = available.filter(
        (o) => !recommendedIds.has(o.id)
      );

      return {
        compId: comp.id,
        compName: comp.name,
        recommended,
        available: availableMinusRecommended,
        completed,
      };
    });
  }, [curriculum, recommendedIds, completedIds]);

  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  }
  if (!curriculum) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-300">
        🗺️ Mapa de Aprendizaje – {curriculum.name}
      </h1>

      {byCompetency.map((group) => (
        <section key={group.compId} className="mb-10">
          <header className="mb-4">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              📘 {group.compName}
            </h2>
          </header>

          {/* 1) Sugeridos por CapiBot (si hay) */}
          {group.recommended.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium text-teal-700 dark:text-teal-300">
                  🤖 Sugeridos por CapiBot
                </h3>
                <span className="text-xs rounded-full bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                  {group.recommended.length} objetivo(s)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {group.recommended.map((o) => (
                  <ProgressNode
                    key={o.id}
                    label={o.name}
                    to={`/student/practice/${curriculum.id}/${group.compId}/${o.standardId}/${o.id}`}
                    status="available"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2) ¿Qué aprenderás? (disponibles) */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-medium text-teal-700 dark:text-teal-300">
                🎯 ¿Qué aprenderás?
              </h3>
              <span className="text-xs rounded-full bg-sky-100 px-2 py-1 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200">
                {group.available.length} objetivo(s)
              </span>
            </div>
            {group.available.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {group.available.map((o) => (
                  <ProgressNode
                    key={o.id}
                    label={o.name}
                    to={`/student/practice/${curriculum.id}/${group.compId}/${o.standardId}/${o.id}`}
                    status="available"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                No hay objetivos disponibles (¡revisa los completados!).
              </div>
            )}
          </div>

          {/* 3) Completados (si hay) */}
          {group.completed.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium text-teal-700 dark:text-teal-300">
                  ✅ Objetivos completados
                </h3>
                <span className="text-xs rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  {group.completed.length} objetivo(s)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {group.completed.map((o) => (
                  <ProgressNode
                    key={o.id}
                    label={o.name}
                    to={`/student/practice/${curriculum.id}/${group.compId}/${o.standardId}/${o.id}`}
                    status="available" /* cambia a "completed" si tu componente lo soporta */
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

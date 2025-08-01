// src/pages/student/Roadmap.tsx
import { useEffect, useState } from "react";
import { getCurriculumFull } from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";
import LoadingScreen from "../../components/LoadingScreen";
import ProgressNode from "../../components/student/ProgressNode";

export default function Roadmap() {
  const [curriculum, setCurriculum] = useState<CurriculumFullResponse | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getCurriculumFull(
          "bca2c911-a4fe-4327-b21c-3d2d09497161"
        );
        setCurriculum(data);
      } catch (error) {
        console.error("Error al cargar el currículo:", error);
      }
    })();
  }, []);

  if (!curriculum) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-300">
        🗺️ Mapa de Aprendizaje – {curriculum.name}
      </h1>

      {curriculum.competencies.map((competency) => (
        <div key={competency.id} className="mb-8">
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
            📘 {competency.name}
          </h2>

          {competency.standards.map((standard) => (
            <div key={standard.id} className="ml-4 mb-4">
              <h3 className="text-lg font-medium text-teal-700 dark:text-teal-300 mb-2">
                📗 {standard.name}
              </h3>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-2">
                {standard.learningObjectives.map((lo) => (
                  <ProgressNode
                    key={lo.id}
                    label={lo.name}
                    to={`/student/practice/${curriculum.id}/${competency.id}/${standard.id}/${lo.id}`}
                    status="available" // temporal hasta integrar progreso real
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// src/pages/student/Roadmap.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCurriculumFull,
  setCurrentCurriculumId,
} from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";
import LoadingScreen from "../../components/LoadingScreen";
import HeroBanner from "../../components/student/HeroBanner";
import RecommendationsPanel from "../../components/student/RecommendationsPanel";
import { useObjectiveStatuses } from "../../hooks/progress/useObjectiveStatuses";
import { useObjectiveCoverage } from "../../hooks/progress/useObjectiveCoverage";
import CompetencyExplorer from "../../components/student/CompetencyExplorer";
import RecentObjectivesStrip from "../../components/student/RecentObjectivesStrip";

export default function Roadmap() {
  const { id: curriculumId } = useParams<{ id: string }>();
  const [curriculum, setCurriculum] = useState<CurriculumFullResponse | null>(
    null
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (curriculumId) {
      try {
        setCurrentCurriculumId(curriculumId);
      } catch {
        /* noop */
      }
    }
  }, [curriculumId]);

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

  const {
    data: statusSets,
    isLoading: loadingStatus,
    isError: errorStatus,
  } = useObjectiveStatuses(curriculumId);

  const { data: coverageMap } = useObjectiveCoverage(curriculumId);

  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  }
  if (!curriculum) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-8">
      {/* HERO */}
      <HeroBanner
        title="Selecciona lo que quieres aprender o reforzar hoy"
        subtitle="Primero te recomendamos, luego eliges libremente por competencia."
      />

      {/* RECOMENDADOS (PRINCIPAL) */}
      <div className="mt-2 mb-6">
        <RecommendationsPanel limit={6} subject="math" />
      </div>

      {/* RECIENTES */}
      <RecentObjectivesStrip curriculumId={curriculum.id} />

      {/* ESTADO DE PROGRESO (sutil) */}
      {loadingStatus && (
        <div
          className="mb-3 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Cargando tu progreso…
        </div>
      )}
      {errorStatus && (
        <div className="mb-3 text-sm text-red-500" role="alert">
          No se pudieron cargar tus estados de objetivos. Igual puedes explorar.
        </div>
      )}

      {/* EXPLORADOR: Competencia → Estándar → Objetivos (con filtro local + búsqueda) */}
      <section aria-label="Explorar por competencias">
        <CompetencyExplorer
          curriculum={curriculum}
          statusSets={statusSets ?? null}
          coverageMap={coverageMap ?? null}
        />
      </section>
    </div>
  );
}

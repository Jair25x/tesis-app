// src/hooks/useCompetencyMap.ts
import { useEffect, useState } from "react";
import { getCompetenciesByCurriculum } from "../services/competencyService";
import type { CompetencyResponse } from "../types/curriculum/Competency";
import type { CurriculumResponse } from "../types/curriculum/Curriculum";

export function useCompetencyMap(curricula?: CurriculumResponse[]) {
  const [competencyMap, setCompetencyMap] = useState<
    Record<string, CompetencyResponse[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetencies = async () => {
      if (!curricula || curricula.length === 0) return;

      setLoading(true);
      const map: Record<string, CompetencyResponse[]> = {};

      await Promise.all(
        curricula.map(async (curriculum) => {
          try {
            const competencies = await getCompetenciesByCurriculum(
              curriculum.id,
              "active"
            );
            map[curriculum.id] = competencies;
          } catch (error) {
            console.error(
              `Error al obtener competencias para currículo ${curriculum.id}:`,
              error
            );
            map[curriculum.id] = [];
          }
        })
      );

      setCompetencyMap(map);
      setLoading(false);
    };

    fetchCompetencies();
  }, [curricula]);

  return { competencyMap, loading };
}

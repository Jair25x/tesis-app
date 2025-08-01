// src/pages/admin/explorer/ExplorerDashboard.tsx
import { useExplorerContext } from "./ExplorerContext";
import CurriculumSelector from "./CurriculumSelector";
import CompetencySelector from "./CompetencySelector";
import StandardSelector from "./StandardSelector";
// import LearningObjectiveSelector from "./LearningObjectiveSelector";
// import ExerciseList from "./ExerciseList";

export default function ExplorerDashboard() {
  const {
    selectedCurriculum,
    selectedCompetency,
    // selectedStandard,
    // selectedObjective,
  } = useExplorerContext();

  return (
    <section className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white text-center">
        Explorador Curricular
      </h1>

      <div className="space-y-6">
        {/* Paso 1: Selección de Currículo */}
        <CurriculumSelector />

        {/* Paso 2: Selección de Competencia */}
        {selectedCurriculum && <CompetencySelector />}

        {/* Paso 3: Selección de Estándar */}
        {selectedCurriculum && selectedCompetency && <StandardSelector />}

        {/* Paso 4: Objetivo de aprendizaje */}
        {/* {selectedCurriculum && selectedCompetency && selectedStandard && (
          <LearningObjectiveSelector />
        )} */}

        {/* Paso 5: Ejercicios */}
        {/* {selectedCurriculum &&
          selectedCompetency &&
          selectedStandard &&
          selectedObjective && (
            <ExerciseList />
          )} */}
      </div>
    </section>
  );
}

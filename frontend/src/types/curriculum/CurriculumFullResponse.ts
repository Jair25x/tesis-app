// src/types/curriculum/CurriculumFullResponse.ts

/**
 * Representa la estructura jerárquica completa de un currículo educativo.
 * Se utiliza para construir el Roadmap del estudiante (Curriculum → Competencias → Estándares → Objetivos → Ejercicios).
 */
export interface CurriculumFullResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  grade: string;
  competencies: CompetencyNode[];
}

/**
 * Nodo que representa una competencia dentro del currículo.
 */
export interface CompetencyNode {
  id: string;
  code: string;
  name: string;
  standards: StandardNode[];
}

/**
 * Nodo que representa un estándar asociado a una competencia.
 */
export interface StandardNode {
  id: string;
  code: string;
  name: string;
  learningObjectives: LearningObjectiveNode[];
}

/**
 * Nodo que representa un objetivo de aprendizaje dentro de un estándar.
 */
export interface LearningObjectiveNode {
  id: string;
  code: string;
  name: string;
  exercises: ExerciseLeaf[];
}

/**
 * Hoja final de ejercicios asociados a un objetivo de aprendizaje.
 */
export interface ExerciseLeaf {
  id: string;
  statement: string;
  difficulty: string;
}

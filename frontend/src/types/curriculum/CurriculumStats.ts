// src/types/curriculum/CurriculumStats.ts

/**
 * DTO de respuesta para estadísticas de un currículo.
 */
export interface CurriculumStatsResponse {
  curriculumId: string;
  curriculumName: string;
  totalCompetencies: number;
  totalStandards: number;
  totalLearningObjectives: number;
}

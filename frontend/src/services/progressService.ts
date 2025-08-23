// src/services/progressService.ts
import api from "./api";
import type {
  Overview,
  OverviewDto,
  Streak,
  StreakDto,
  AttemptRequest,
  AttemptRequestDto,
  AttemptResponse,
  AttemptResponseDto,
  Achievement,
  AchievementDto,
  AchievementMeta,
  DailyStat,
  DailyStatDto,
  SeriesRange,
} from "../types/progress/ProgressTypes";

// Overview
export const getOverview = async (signal?: AbortSignal): Promise<Overview> => {
  const { data } = await api.get<OverviewDto>(
    "/progress/students/me/overview",
    { signal }
  );
  return {
    date: new Date().toISOString().slice(0, 10),
    attempts: data.dailyAttempts,
    correct: data.dailyCorrect,
    objectivesCompleted: data.masteredObjectives,
  };
};

// Streak
export const getStreak = async (signal?: AbortSignal): Promise<Streak> => {
  const { data } = await api.get<StreakDto>("/progress/students/me/streak", {
    signal,
  });
  return {
    current: data.current,
    longest: data.longest,
    lastUpdated: new Date().toISOString(),
  };
};

// Achievements
export const getAchievements = async (
  signal?: AbortSignal
): Promise<Achievement[]> => {
  const { data } = await api.get<AchievementDto[]>(
    "/progress/students/me/achievements",
    { signal }
  );
  return data.map((a) => ({
    code: a.code,
    name: a.name,
    description: a.description,
    earnedAt: a.earnedAt,
  }));
};

// Attempt
export const postAttempt = async (
  req: AttemptRequest
): Promise<AttemptResponse> => {
  const dto: AttemptRequestDto = {
    ...req,
    source: req.source ?? "PRACTICE",
  };

  const { data } = await api.post<AttemptResponseDto>(
    "/progress/attempts",
    dto
  );

  return {
    attemptId: data.attemptId,
    correct: data.correct,
    score: data.score,
    feedback: data.feedback, // objeto o string; el Player ya lo serializa si hace falta
    sop: data.sop,
    updatedStreak: data.streak
      ? {
          current: data.streak.current,
          longest: data.streak.longest,
          lastUpdated: new Date().toISOString(),
        }
      : undefined,
    awardedAchievements: data.unlocked?.map((a) => ({
      code: a.code,
      name: a.name,
      description: a.description,
      earnedAt: a.earnedAt,
    })),
  };
};

export const getAchievementsCatalog = async (
  signal?: AbortSignal
): Promise<AchievementMeta[]> => {
  try {
    const { data } = await api.get<AchievementCatalogDto[]>(
      "/progress/achievements/catalog",
      { signal }
    );
    if (!Array.isArray(data)) return [];
    return data.map((a) => ({
      code: a.code,
      name: a.name,
      description: a.description,
      points: a.points,
    }));
  } catch {
    // Fallback: catálogo vacío -> UI solo mostrará desbloqueados
    return [];
  }
};

type AchievementCatalogDto = {
  code: string;
  name: string;
  description?: string;
  points?: number;
};

// Serie diaria del estudiante autenticado
export const getMySeries = async (
  range: SeriesRange,
  curriculumId?: string,
  signal?: AbortSignal
): Promise<DailyStat[]> => {
  const params = new URLSearchParams();
  params.set("range", range);
  if (curriculumId) params.set("curriculumId", curriculumId);

  const { data } = await api.get<DailyStatDto[]>(
    `/progress/students/me/series?${params.toString()}`,
    { signal }
  );

  // Normaliza por si el backend en el futuro cambia fecha → aquí mantenemos formato
  return (Array.isArray(data) ? data : []).map((d) => ({
    date: d.date,
    attempts: d.attempts ?? 0,
    correct: d.correct ?? 0,
  }));
};

// 👇 Alias para que tus hooks actuales no rompan
export {
  getMySeries as getStudentDailySeries,
  getOverview as getMyOverview,
  getStreak as getMyStreak,
  getAchievements as getMyAchievements,
};

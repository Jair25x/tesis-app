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
  ObjectiveStatusItem,
  ObjectiveStatusResponse,
  ObjectiveCoverageItem,
  ObjectiveCoverageResponse,
} from "../types/progress/ProgressTypes";

// --- helpers ---
function extractUuid(input?: string): string | undefined {
  if (!input) return undefined;
  const m = input.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/
  );
  return m ? m[0].toLowerCase() : undefined;
}

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
    curriculumId: req.curriculumId,
    learningObjectiveId: req.learningObjectiveId,
    exerciseId: req.exerciseId,
    templateType: req.templateType,
    difficulty: req.difficulty,
    answer: req.answer,
    hintsUsed: req.hintsUsed ?? 0,
    durationMs: req.durationMs,
    sessionId: req.sessionId,
    source: req.source ?? "PRACTICE",
  };

  // ✅ sanea sourceRefId → UUID o lo omite
  const clean = extractUuid(req.sourceRefId);
  if (clean) {
    dto.sourceRefId = clean;
  }

  const { data } = await api.post<AttemptResponseDto>(
    "/progress/attempts",
    dto
  );

  return {
    attemptId: data.attemptId,
    correct: data.correct,
    score: data.score,
    feedback: data.feedback,
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

  return (Array.isArray(data) ? data : []).map((d) => ({
    date: d.date,
    attempts: d.attempts ?? 0,
    correct: d.correct ?? 0,
    activeStudents: d.activeStudents,
  }));
};

// Estados por objetivo
export const getObjectiveStatuses = async (
  curriculumId?: string,
  signal?: AbortSignal
): Promise<ObjectiveStatusItem[]> => {
  const params = new URLSearchParams();
  if (curriculumId) params.set("curriculumId", curriculumId);

  const { data } = await api.get<ObjectiveStatusResponse>(
    `/progress/students/me/objectives/status${
      params.toString() ? `?${params}` : ""
    }`,
    { signal }
  );
  return Array.isArray(data) ? data : [];
};

// Cobertura por objetivo
export const getObjectiveCoverage = async (
  curriculumId?: string,
  signal?: AbortSignal
): Promise<ObjectiveCoverageItem[]> => {
  const params = new URLSearchParams();
  if (curriculumId) params.set("curriculumId", curriculumId);

  const { data } = await api.get<ObjectiveCoverageResponse>(
    `/progress/students/me/objectives/coverage${
      params.toString() ? `?${params}` : ""
    }`,
    { signal }
  );
  return Array.isArray(data) ? data : [];
};

export {
  getMySeries as getStudentDailySeries,
  getOverview as getMyOverview,
  getStreak as getMyStreak,
  getAchievements as getMyAchievements,
};

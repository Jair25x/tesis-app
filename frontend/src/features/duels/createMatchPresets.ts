// src/features/duels/createMatchPresets.ts
import type { CreateMatchReq, Difficulty} from "../../types/duels/duels";

export type DuelPresetKey = "quick" | "bestOf3" | "bestOf5" | "firstTo5";

export interface DuelBaseSettings {
  curriculumId: string;
  objectiveId?: string;
  difficulty?: Difficulty;
  isPublic?: boolean;
  maxPlayers?: number;          // por defecto 2 si no se indica
}

export interface DuelPresetSettings extends DuelBaseSettings {
  preset: DuelPresetKey;
  questionsPerRound?: number;   // si el preset lo usa
  questionTimeSec?: number;     // si el preset lo usa
}

/**
 * Mapea un preset (“duelo rápido”, “mejor de 3”, “primero a 5 puntos”…)
 * a un CreateMatchReq listo para enviar al backend.
 *
 * Los valores concretos (tiempo por pregunta, preguntas por ronda, etc.)
 * son valores por defecto razonables; puedes afinarlos sin tocar el resto.
 */
export function buildCreateMatchReq(settings: DuelPresetSettings): CreateMatchReq {
  const {
    curriculumId,
    objectiveId,
    difficulty,
    isPublic = true,
    maxPlayers = 2,
    preset,
    questionsPerRound,
    questionTimeSec,
  } = settings;

  // Valores base comunes
  const base: Omit<CreateMatchReq, "mode" | "bestOf" | "winTarget" | "questionTimeSec"> = {
    curriculumId,
    objectiveId,
    difficulty,
    isPublic,
    maxPlayers,
  };

  switch (preset) {
    case "quick": {
      // Duelo rápido:
      // - 1 ronda (bestOf=1)
      // - modo por tiempo por pregunta
      // - pocas preguntas por ronda
      const qpr = questionsPerRound ?? 2;
      const qTime = questionTimeSec ?? 45; // segundos

      const req: CreateMatchReq = {
        ...base,
        mode: "timePerQuestion",
        bestOf: 1,
        questionsPerRound: qpr,
        questionTimeSec: qTime,
      };
      return req;
    }

    case "bestOf3": {
      // Mejor de 3:
      // - bestOf=3
      // - modo bestOf
      // - x preguntas por ronda (lo que definas en tu UI)
      const qpr = questionsPerRound ?? 2;

      const req: CreateMatchReq = {
        ...base,
        mode: "bestOf",
        bestOf: 3,
        questionsPerRound: qpr,
      };
      return req;
    }

    case "bestOf5": {
      const qpr = questionsPerRound ?? 2;

      const req: CreateMatchReq = {
        ...base,
        mode: "bestOf",
        bestOf: 5,
        questionsPerRound: qpr,
      };
      return req;
    }

    case "firstTo5": {
      // Primero a 5:
      // - modo firstToAll
      // - winTarget=5
      // - se puede seguir usando questionsPerRound para batch de ejercicios
      const qpr = questionsPerRound ?? 1;

      const req: CreateMatchReq = {
        ...base,
        mode: "firstToAll",
        winTarget: 5,
        questionsPerRound: qpr,
      };
      return req;
    }

    default: {
      // Fallback ultra seguro: equivalente a “duelo rápido”
      const qpr = questionsPerRound ?? 2;
      const qTime = questionTimeSec ?? 45;

      const req: CreateMatchReq = {
        ...base,
        mode: "timePerQuestion",
        bestOf: 1,
        questionsPerRound: qpr,
        questionTimeSec: qTime,
      };
      return req;
    }
  }
}

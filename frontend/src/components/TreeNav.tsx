import { useState } from "react";
import type { CurriculumFullResponse } from "../types/curriculum/CurriculumFullResponse";

type OnSelectPayload = {
  curriculumId: string;
  competencyId: string;
  standardId: string;
  learningObjectiveId: string;
  exerciseId: string;
};

type Props = {
  data: CurriculumFullResponse;
  onSelectExercise: (p: OnSelectPayload) => void;
};

export default function TreeNav({ data, onSelectExercise }: Props) {
  const [openComp, setOpenComp] = useState<string | null>(null);
  const [openStd, setOpenStd] = useState<string | null>(null);
  const [openLo, setOpenLo] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {data.competencies.map((comp) => (
        <div key={comp.id} className="rounded-lg border p-2">
          <button
            className="w-full text-left font-semibold"
            onClick={() => setOpenComp(openComp === comp.id ? null : comp.id)}
          >
            {comp.code} — {comp.name}
          </button>

          {openComp === comp.id && (
            <div className="mt-2 ml-3 space-y-2">
              {comp.standards.map((std) => (
                <div key={std.id} className="rounded-md border p-2">
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setOpenStd(openStd === std.id ? null : std.id)
                    }
                  >
                    {std.code} — {std.name}
                  </button>

                  {openStd === std.id && (
                    <div className="mt-2 ml-3 space-y-2">
                      {std.learningObjectives.map((lo) => (
                        <div key={lo.id} className="rounded bg-muted/30 p-2">
                          <button
                            className="w-full text-left"
                            onClick={() =>
                              setOpenLo(openLo === lo.id ? null : lo.id)
                            }
                          >
                            {lo.code} — {lo.name}
                          </button>

                          {openLo === lo.id && (
                            <ul className="mt-2 ml-3 list-disc space-y-1">
                              {lo.exercises.map((ex) => (
                                <li key={ex.id}>
                                  <button
                                    className="underline"
                                    onClick={() =>
                                      onSelectExercise({
                                        curriculumId: data.id,
                                        competencyId: comp.id,
                                        standardId: std.id,
                                        learningObjectiveId: lo.id,
                                        exerciseId: ex.id,
                                      })
                                    }
                                  >
                                    {ex.statement?.slice(0, 64) ||
                                      `Ejercicio ${ex.id
                                        .toString()
                                        .slice(0, 6)}…`}
                                  </button>
                                </li>
                              ))}
                              {lo.exercises.length === 0 && (
                                <li className="text-sm text-muted-foreground">
                                  (Sin ejercicios)
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// src/features/assessments/modules/adapters/NUMBER_WORDS_BIDIR.ts
// NUMBER_WORDS_BIDIR adapter (assessment)
import type { ExamAdapter } from "../../../exercises/shared/types";
import type { NumberWordsParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/NUMBER_WORDS_BIDIR";
import { normalizeWords, toNumberStrict } from "./_utils";

type UIValue = string;
type Wire = {
  template: "NUMBER_WORDS_BIDIR";
  value: string | number;
};

const MODULE: ExamAdapter<NumberWordsParams, UIValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,

  isValid: (v, params) => CORE.isValid((v ?? "") as string, params),

  Render: (props) =>
    CORE.Render({
      ...props,
      value: (props.value ?? "") as string,
      onChange: (next: string) => props.onChange(next),
    }),

  write: (v: unknown): Wire => {
    // Si ya viene como número, lo respetamos
    if (typeof v === "number" && Number.isFinite(v)) {
      return { template: "NUMBER_WORDS_BIDIR", value: v };
    }

    if (typeof v === "string") {
      const trimmed = v.trim();
      // Si parece número estricto → lo enviamos numérico
      const n = toNumberStrict(trimmed);
      if (n !== null) {
        return {
          template: "NUMBER_WORDS_BIDIR",
          value: n,
        };
      }
      // Si no es número → lo tratamos como palabras normalizadas
      return {
        template: "NUMBER_WORDS_BIDIR",
        value: normalizeWords(trimmed),
      };
    }

    // Fallback
    return { template: "NUMBER_WORDS_BIDIR", value: "" };
  },
};

export default MODULE;

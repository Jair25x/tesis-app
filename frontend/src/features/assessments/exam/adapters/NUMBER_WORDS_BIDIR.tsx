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

  isValid: (v, params) => CORE.isValid(v ?? "", params),

  Render: (props) =>
    CORE.Render({
      ...props,
      value: (props.value ?? "") as string,
      onChange: (next: string) => props.onChange(next),
    }),

  write: (v: unknown, params?: NumberWordsParams): Wire => {
    const direction = params?.direction ?? "WORDS_TO_DIGITS";

    // Ya numérico
    if (typeof v === "number" && Number.isFinite(v)) {
      return { template: "NUMBER_WORDS_BIDIR", value: v };
    }

    if (typeof v === "string") {
      if (direction === "DIGITS_TO_WORDS") {
        // Esperamos palabras → normaliza texto
        return {
          template: "NUMBER_WORDS_BIDIR",
          value: normalizeWords(v),
        };
      }

      // WORDS_TO_DIGITS → intentamos número; si no, 0
      const n = toNumberStrict(v);
      return {
        template: "NUMBER_WORDS_BIDIR",
        value: n !== null ? n : 0,
      };
    }

    // Fallback
    return { template: "NUMBER_WORDS_BIDIR", value: "" };
  },
};

export default MODULE;

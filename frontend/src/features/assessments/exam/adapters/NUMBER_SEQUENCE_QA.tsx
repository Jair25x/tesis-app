import type { ExamAdapter } from "../../../exercises/shared/types";
import type { NumberSequenceParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/NUMBER_SEQUENCE_QA";
import { toNumberStrict } from "./_utils";



type NSValue = "" | number | number[];
type Wire = { value?: number | number[]; values?: number[] }; // acepta ambos

const MODULE: ExamAdapter<NumberSequenceParams, NSValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,
  isValid: CORE.isValid,
  Render: CORE.Render,
  write: (v: unknown): Wire => {
    if (Array.isArray(v)) {
      const arr = v.map((x) =>
        typeof x === "number" ? x : toNumberStrict(String(x)) ?? 0
      );
      return { values: arr };
    }
    if (typeof v === "number" && Number.isFinite(v)) return { value: v };
    if (typeof v === "string") {
      const n = toNumberStrict(v);
      return { value: n ?? 0 };
    }
    return { value: 0 };
  },
};

export default MODULE;

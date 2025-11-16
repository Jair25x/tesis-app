import type { ExamAdapter } from "../../../exercises/shared/types";
import type { NumberSequenceParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/NUMBER_SEQUENCE_QA";
import { toNumberStrict } from "./_utils";

type NSValue = "" | number | number[];
type Wire = {
  template: "NUMBER_SEQUENCE_QA";
  value?: number | number[];
  values?: number[];
}; // acepta ambas variantes

const MODULE: ExamAdapter<NumberSequenceParams, NSValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,
  isValid: CORE.isValid,
  Render: CORE.Render,

  write: (v: unknown): Wire => {
    // Múltiples huecos → usamos `values`
    if (Array.isArray(v)) {
      const arr = v.map((x) =>
        typeof x === "number" ? x : toNumberStrict(String(x)) ?? 0
      );
      return {
        template: "NUMBER_SEQUENCE_QA",
        values: arr,
      };
    }

    // Único hueco → `value`
    if (typeof v === "number" && Number.isFinite(v)) {
      return { template: "NUMBER_SEQUENCE_QA", value: v };
    }

    if (typeof v === "string") {
      const n = toNumberStrict(v);
      return {
        template: "NUMBER_SEQUENCE_QA",
        value: n ?? 0,
      };
    }

    return { template: "NUMBER_SEQUENCE_QA", value: 0 };
  },
};

export default MODULE;

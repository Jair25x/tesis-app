import type { ExamAdapter } from "../../../exercises/shared/types";
import type { PlaceValueParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/PLACE_VALUE_QA";
import { normalizeWords, toNumberStrict } from "./_utils";

type UIValue = string | number;
type Wire = {
  template: "PLACE_VALUE_QA";
  value: string | number;
};

const MODULE: ExamAdapter<PlaceValueParams, UIValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,
  isValid: CORE.isValid,
  Render: CORE.Render,

  write: (v: unknown): Wire => {
    // Ya numérico
    if (typeof v === "number" && Number.isFinite(v)) {
      return { template: "PLACE_VALUE_QA", value: v };
    }

    if (typeof v === "string") {
      const n = toNumberStrict(v);
      if (n !== null) {
        return { template: "PLACE_VALUE_QA", value: n };
      }
      // Texto (por si hay asks de tipo descomposición en palabras)
      return { template: "PLACE_VALUE_QA", value: normalizeWords(v) };
    }

    return { template: "PLACE_VALUE_QA", value: "" };
  },
};

export default MODULE;

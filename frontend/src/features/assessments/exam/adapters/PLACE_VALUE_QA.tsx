import type { ExamAdapter } from "../../../exercises/shared/types";
import type { PlaceValueParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/PLACE_VALUE_QA";
import { normalizeWords, toNumberStrict } from "./_utils";


type UIValue = string | number;
type Wire = { value: string | number };

const MODULE: ExamAdapter<PlaceValueParams, UIValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,
  isValid: CORE.isValid,
  Render: CORE.Render,
  write: (v: unknown): Wire => {
    if (typeof v === "number" && Number.isFinite(v)) return { value: v };
    if (typeof v === "string") {
      const n = toNumberStrict(v);
      if (n !== null) return { value: n };
      return { value: normalizeWords(v) };
    }
    return { value: "" };
  },
};

export default MODULE;
import type { ExamAdapter } from "../../../exercises/shared/types";
import type { BaseTenBlocksParams } from "../../../../types/exercise/TemplateParams";
import CORE from "../../../exercises/shared/cores/BASE_TEN_BLOCKS_QA";
import { toNumberStrict } from "./_utils";



type UIValue = number | "";
type Wire = { value: number };

const MODULE: ExamAdapter<BaseTenBlocksParams, UIValue, Wire> = {
  guard: CORE.guard,
  read: CORE.read,
  isValid: CORE.isValid,
  Render: CORE.Render,
  write: (v: unknown): Wire => {
    if (typeof v === "number" && Number.isFinite(v)) return { value: v };
    if (typeof v === "string") {
      const n = toNumberStrict(v);
      return { value: n ?? 0 };
    }
    return { value: 0 };
  },
};

export default MODULE;

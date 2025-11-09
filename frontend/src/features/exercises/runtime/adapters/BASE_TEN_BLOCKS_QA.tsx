import type { RuntimeAdapter } from "../../shared/types";
import type { BaseTenBlocksParams } from "../../../../types/exercise/TemplateParams";
import BASE_TEN_BLOCKS_QA from "../../shared/cores/BASE_TEN_BLOCKS_QA";

type Value = number | ""; // BT_Value

const MODULE: RuntimeAdapter<BaseTenBlocksParams, Value> = {
  guard: BASE_TEN_BLOCKS_QA.guard,
  read: BASE_TEN_BLOCKS_QA.read,
  isValid: BASE_TEN_BLOCKS_QA.isValid,
  Render: BASE_TEN_BLOCKS_QA.Render,

  write: (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) return { value: v };
    return { value: "" };
  },
};

export default MODULE;

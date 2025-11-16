import type { RuntimeAdapter } from "../../shared/types";
import type { NumberSequenceParams } from "../../../../types/exercise/TemplateParams";
import NUMBER_SEQUENCE_QA from "../../shared/cores/NUMBER_SEQUENCE_QA";

type Value = number | number[] | ""; // NS_Value

const MODULE: RuntimeAdapter<NumberSequenceParams, Value> = {
  guard: NUMBER_SEQUENCE_QA.guard,
  read: NUMBER_SEQUENCE_QA.read,
  isValid: NUMBER_SEQUENCE_QA.isValid,
  Render: NUMBER_SEQUENCE_QA.Render,

  write: (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) {
      return {
        template: "NUMBER_SEQUENCE_QA",
        value: v,
      };
    }

    if (
      Array.isArray(v) &&
      v.every((x) => typeof x === "number" && Number.isFinite(x))
    ) {
      return {
        template: "NUMBER_SEQUENCE_QA",
        value: v as number[],
      };
    }

    return {
      template: "NUMBER_SEQUENCE_QA",
      value: "",
    };
  },
};

export default MODULE;

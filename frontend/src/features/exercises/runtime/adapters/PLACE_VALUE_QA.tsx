// src/features/exercises/runtimes/adapters/PLACE_VALUE_QA.ts
import type { RuntimeAdapter } from "../../shared/types";
import type { PlaceValueParams } from "../../../../types/exercise/TemplateParams";
import PLACE_VALUE_QA from "../../shared/cores/PLACE_VALUE_QA";

type Value = string | number;

const MODULE: RuntimeAdapter<PlaceValueParams, Value> = {
  guard: PLACE_VALUE_QA.guard,
  read: PLACE_VALUE_QA.read,
  isValid: PLACE_VALUE_QA.isValid,
  Render: PLACE_VALUE_QA.Render,

  write: (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) {
      return {
        template: "PLACE_VALUE_QA",
        value: v,
      };
    }
    if (typeof v === "string") {
      return {
        template: "PLACE_VALUE_QA",
        value: v.trim(),
      };
    }
    return {
      template: "PLACE_VALUE_QA",
      value: "",
    };
  },
};

export default MODULE;

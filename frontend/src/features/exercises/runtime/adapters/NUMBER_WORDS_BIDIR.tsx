import type { RuntimeAdapter } from "../../shared/types";
import type { NumberWordsParams } from "../../../../types/exercise/TemplateParams";
import NUMBER_WORDS_BIDIR from "../../shared/cores/NUMBER_WORDS_BIDIR";

type Value = string; // NW_Value

const MODULE: RuntimeAdapter<NumberWordsParams, Value> = {
  guard: NUMBER_WORDS_BIDIR.guard,
  read: NUMBER_WORDS_BIDIR.read,
  isValid: NUMBER_WORDS_BIDIR.isValid,
  Render: NUMBER_WORDS_BIDIR.Render,

  // Serializa el valor actual a un objeto plano
  write: (v: unknown) => {
    if (typeof v === "string") {
      return {
        template: "NUMBER_WORDS_BIDIR",
        value: v.trim(),
      };
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      return {
        template: "NUMBER_WORDS_BIDIR",
        value: String(v),
      };
    }
    return {
      template: "NUMBER_WORDS_BIDIR",
      value: "",
    };
  },
};

export default MODULE;

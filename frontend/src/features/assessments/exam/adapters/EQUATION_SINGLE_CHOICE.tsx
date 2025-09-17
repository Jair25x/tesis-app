/* eslint-disable react-refresh/only-export-components */
import { makeExamAdapter } from "../../../exercises/shared/factory";
import core from "../../../exercises/shared/cores/EQUATION_SINGLE_CHOICE";

// El curriculum espera StudentAnswerShape con template + value
export default makeExamAdapter(core, (v) => ({
  template: "EQUATION_SINGLE_CHOICE",
  value: v,
}));

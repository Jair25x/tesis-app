/* eslint-disable react-refresh/only-export-components */
import { makeExamAdapter } from "../../../exercises/shared/factory";
import core from "../../../exercises/shared/cores/FREQUENCY_TABLE_COMPLETE";

export default makeExamAdapter(core, (v) => ({
  template: "FREQUENCY_TABLE_COMPLETE",
  filled: v,
}));

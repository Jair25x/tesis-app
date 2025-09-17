/* eslint-disable react-refresh/only-export-components */
import { makeRuntimeAdapter } from "../../shared/factory";
import core from "../../shared/cores/FREQUENCY_TABLE_QA";

export default makeRuntimeAdapter(core, (v) => ({
  template: "FREQUENCY_TABLE_QA",
  answers: v,
}));

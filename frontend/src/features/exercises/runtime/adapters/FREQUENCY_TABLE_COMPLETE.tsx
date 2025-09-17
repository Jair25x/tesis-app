/* eslint-disable react-refresh/only-export-components */
import { makeRuntimeAdapter } from "../../shared/factory";
import core from "../../shared/cores/FREQUENCY_TABLE_COMPLETE";

export default makeRuntimeAdapter(core, (v) => ({
  template: "FREQUENCY_TABLE_COMPLETE",
  filled: v,
}));

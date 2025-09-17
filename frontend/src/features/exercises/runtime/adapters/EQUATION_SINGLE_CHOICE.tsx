/* eslint-disable react-refresh/only-export-components */
import { makeRuntimeAdapter } from "../../shared/factory";
import core from "../../shared/cores/EQUATION_SINGLE_CHOICE";

export default makeRuntimeAdapter(core, (v) => ({
  template: "EQUATION_SINGLE_CHOICE",
  value: v,
}));

import { useContext } from "react";
import { SolutionStepContext } from "./SolutionStepContext";

export function useSolutionStep() {
  const context = useContext(SolutionStepContext);
  if (!context) {
    throw new Error(
      "useSolutionStep debe usarse dentro de un SolutionStepProvider"
    );
  }
  return context;
}

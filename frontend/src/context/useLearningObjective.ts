import { useContext } from "react";
import { LearningObjectiveContext } from "./LearningObjectiveContext";

export function useLearningObjective() {
  const context = useContext(LearningObjectiveContext);
  if (!context) {
    throw new Error(
      "useLearningObjective debe usarse dentro de un LearningObjectiveProvider"
    );
  }
  return context;
}

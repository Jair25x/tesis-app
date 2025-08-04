import { useContext } from "react";
import { ExerciseContext } from "./ExerciseContext";

export function useExercise() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error("useExercise debe usarse dentro de un ExerciseProvider");
  }
  return context;
}

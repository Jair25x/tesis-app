// src/context/useCompetency.ts
import { useContext } from "react";
import { CompetencyContext } from "../context/CompetencyContext";

export function useCompetency() {
  const context = useContext(CompetencyContext);
  if (!context) {
    throw new Error(
      "useCompetency debe usarse dentro de un CompetencyProvider"
    );
  }
  return context;
}

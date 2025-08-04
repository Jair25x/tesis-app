import { useContext } from "react";
import { HintContext } from "./HintContext";

export function useHint() {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error("useHint debe usarse dentro de un HintProvider");
  }
  return context;
}

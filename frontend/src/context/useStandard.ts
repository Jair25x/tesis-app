import { useContext } from "react";
import { StandardContext } from "./StandardContext";

export function useStandard() {
  const context = useContext(StandardContext);
  if (!context) {
    throw new Error("useStandard debe usarse dentro de un StandardProvider");
  }
  return context;
}

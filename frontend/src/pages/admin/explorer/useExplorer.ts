// src/pages/admin/explorer/useExplorer.ts
import { useContext } from "react";
import { ExplorerContext } from "./ExplorerContext";

export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error("useExplorer debe usarse dentro de ExplorerProvider");
  }
  return context;
};

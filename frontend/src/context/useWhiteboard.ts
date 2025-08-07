import { useContext } from "react";
import WhiteboardContext from "./WhiteboardProvider";

export function useWhiteboard() {
  const context = useContext(WhiteboardContext);
  if (!context) throw new Error("WhiteboardProvider is missing");
  return context;
}

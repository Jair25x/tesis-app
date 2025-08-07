// src/context/WhiteboardProvider.tsx
import { createContext, useState } from "react";

const WhiteboardContext = createContext<{
  open: () => void;
  close: () => void;
  isOpen: boolean;
} | null>(null);

export function WhiteboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <WhiteboardContext.Provider value={{ open, close, isOpen }}>
      {children}
    </WhiteboardContext.Provider>
  );
}

export default WhiteboardContext;

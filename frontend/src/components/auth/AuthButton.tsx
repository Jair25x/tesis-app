// src/components/auth/AuthButton.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Botón de formularios: por defecto es type="submit" para que dispare onSubmit.
 * Permite override con props.type si lo necesitas como "button" en otros contextos.
 */
export default function AuthButton({
  children,
  type,
  className,
  ...props
}: AuthButtonProps) {
  const finalType = type ?? "submit";
  const base =
    "w-full bg-[#82d1f4] hover:bg-[#65c0e8] text-[#1e2a34] font-bold py-2 rounded transition uppercase";
  const merged = className ? `${base} ${className}` : base;

  return (
    <button type={finalType} className={merged} {...props}>
      {children}
    </button>
  );
}

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
    "w-full bg-[#82d1f4] hover:bg-[#65c0e8] text-slate-900 font-bold py-2 rounded-lg transition uppercase tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#65c0e8]";
  const merged = className ? `${base} ${className}` : base;

  return (
    <button type={finalType} className={merged} {...props}>
      {children}
    </button>
  );
}

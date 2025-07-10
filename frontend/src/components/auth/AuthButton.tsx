import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function AuthButton({ children, ...props }: AuthButtonProps) {
  return (
    <button
      {...props}
      className="w-full bg-[#82d1f4] hover:bg-[#65c0e8] text-[#1e2a34] font-bold py-2 rounded transition uppercase"
    >
      {children}
    </button>
  );
}

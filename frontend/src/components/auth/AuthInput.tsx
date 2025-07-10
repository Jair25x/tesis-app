// src/components/auth/AuthInput.tsx
import type { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function AuthInput({ label, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-gray-300" htmlFor={props.name}>
          {label}
        </label>
      )}
      <input
        id={props.name}
        {...props}
        className="w-full px-4 py-2 rounded bg-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

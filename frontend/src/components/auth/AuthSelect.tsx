// src/components/auth/AuthSelect.tsx
import type { ChangeEvent } from "react";

export interface AuthSelectProps {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean; // 👈 NUEVO
}

export default function AuthSelect({
  name,
  value,
  options,
  onChange,
  disabled = false, // 👈 por defecto
}: AuthSelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 rounded bg-white text-black"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

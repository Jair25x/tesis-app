// src/components/auth/AuthSelect.tsx
import type { ChangeEventHandler } from "react";

interface Option {
  value: string;
  label: string;
}

interface AuthSelectProps {
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: Option[];
}

export default function AuthSelect({
  name,
  value,
  onChange,
  options,
}: AuthSelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded bg-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

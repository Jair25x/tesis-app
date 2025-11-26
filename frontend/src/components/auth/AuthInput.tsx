import type { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function AuthInput({ label, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          htmlFor={props.name}
        >
          {label}
        </label>
      )}
      <input
        id={props.name}
        {...props}
        className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-400 border border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
  );
}

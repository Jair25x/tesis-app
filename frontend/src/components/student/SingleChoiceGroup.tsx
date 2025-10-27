// src/components/student/SingleChoiceGroup.tsx
type ChoiceGroupProps = {
  name: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
};

export function SingleChoiceGroup({
  name,
  options,
  value,
  onChange,
}: ChoiceGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const id = `${name}-${i}`;
        return (
          <label
            key={opt}
            htmlFor={id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <input
              id={id}
              type="radio"
              name={name}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span className="text-sm text-gray-800 dark:text-gray-100">
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
}

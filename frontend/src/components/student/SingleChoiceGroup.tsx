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
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <input
              id={id}
              type="radio"
              name={name}
              className="h-4 w-4"
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

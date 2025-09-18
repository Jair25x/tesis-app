// src/components/admin/catalog/CatalogFilterBar.tsx
import { useState, useEffect } from "react";

interface Props {
  initialQ?: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export default function CatalogFilterBar({
  initialQ = "",
  onChange,
  placeholder = "Buscar...",
}: Props) {
  const [value, setValue] = useState<string>(initialQ);

  useEffect(() => {
    const id = setTimeout(() => onChange(value.trim()), 350); // debounce corto
    return () => clearTimeout(id);
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b46] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

// src/components/common/Highlight.tsx
import { memo } from "react";

type Props = {
  text: string;
  query: string;
  className?: string;
};

export default memo(function Highlight({ text, query, className }: Props) {
  const q = query.trim();
  if (!q) return <span className={className}>{text}</span>;

  // Escape de caracteres especiales para el regex
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${esc})`, "ig");
  const parts = text.split(re);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark
            key={i}
            className="rounded-sm px-0.5 bg-yellow-200 dark:bg-yellow-800/60"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});

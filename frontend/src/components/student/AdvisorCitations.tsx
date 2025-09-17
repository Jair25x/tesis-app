// src/components/student/AdvisorCitations.tsx

import type { Citation } from "../../types/ai/Chat";

type Props = { citations: Citation[] };

export default function AdvisorCitations({ citations }: Props) {
  if (!citations?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {citations.map((c, i) => (
        <a
          key={`${c.docId}-${i}`}
          href={c.url || "#"}
          target={c.url ? "_blank" : undefined}
          rel="noreferrer"
          className="text-xs rounded-full border px-3 py-1 hover:bg-muted/50 transition"
          title={c.url || c.docId}
        >
          {c.title || c.docId}
        </a>
      ))}
    </div>
  );
}

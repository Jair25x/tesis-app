// src/layouts/MinimalLayout.tsx

import type { PropsWithChildren } from "react";

export default function MinimalLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-indigo-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100">
      {children}
    </div>
  );
}

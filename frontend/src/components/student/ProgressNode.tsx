// src/components/student/ProgressNode.tsx
import { cn } from "../../utils/cn";
import { Link } from "react-router-dom";

export type ProgressStatus =
  | "locked"
  | "available"
  | "in-progress"
  | "completed"
  | "recommended";

interface ProgressNodeProps {
  label: string;
  to: string;
  status: ProgressStatus;
}

export default function ProgressNode({ label, to, status }: ProgressNodeProps) {
  const statusStyles = {
    locked: {
      bg: "bg-gray-300 dark:bg-gray-700",
      text: "text-gray-500 dark:text-gray-400",
      icon: "🔒",
    },
    available: {
      bg: "bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-700",
      text: "text-gray-800 dark:text-gray-100",
      icon: "🎯",
    },
    "in-progress": {
      bg: "bg-yellow-100 dark:bg-yellow-900 animate-pulse",
      text: "text-yellow-700 dark:text-yellow-200",
      icon: "⚡",
    },
    completed: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-700 dark:text-green-200",
      icon: "🏆",
    },
    recommended: {
      bg: "bg-sky-100 dark:bg-sky-900 ring-2 ring-sky-400 dark:ring-sky-300",
      text: "text-sky-800 dark:text-sky-200",
      icon: "✨",
    },
  };

  const { bg, text, icon } = statusStyles[status];

  return status === "locked" ? (
    <span
      aria-disabled="true"
      tabIndex={-1}
      className={cn(
        "transition duration-300 p-4 rounded-xl shadow text-center text-sm font-semibold",
        "pointer-events-none opacity-60",
        bg,
        text
      )}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="line-clamp-2">{label}</div>
    </span>
  ) : (
    <Link
      to={to}
      className={cn(
        "transition duration-300 p-4 rounded-xl shadow text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        bg,
        text
      )}
      aria-label={`${label}. Ir`}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="line-clamp-2">{label}</div>
    </Link>
  );
}

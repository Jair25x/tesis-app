// src/components/ui/BackLink.tsx

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  to: string;
  label: string;
}

export default function BackLink({ to, label }: BackLinkProps) {
  return (
    <div className="mb-4 w-full">
      <Link
        to={to}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
          text-sm sm:text-base font-medium
          text-blue-600 hover:text-blue-800 
          dark:text-blue-400 dark:hover:text-blue-300
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="truncate">{label}</span>
      </Link>
    </div>
  );
}

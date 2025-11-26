// src/layouts/components/MobileHeader.tsx
import React from "react";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSidebar }) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-white p-4 shadow md:hidden dark:bg-[#1e2a34]">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="transition-colors text-black hover:text-green-600 dark:text-white dark:hover:text-green-400"
        title="Abrir menú"
        aria-label="Abrir menú lateral"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        TesisApp
      </h1>
    </header>
  );
};

export default MobileHeader;

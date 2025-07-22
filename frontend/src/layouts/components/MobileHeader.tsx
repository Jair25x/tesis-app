import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 p-4 flex items-center justify-between bg-white dark:bg-[#1e2a34] shadow z-20">
      <button
        onClick={onOpenSidebar}
        className="text-black dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
        title="Abrir menú"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-semibold">TesisApp</h1>
    </header>
  );
}

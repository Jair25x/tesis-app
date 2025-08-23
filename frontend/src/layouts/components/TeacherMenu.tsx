import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface TeacherMenuProps {
  teacherOpen: boolean;
  setTeacherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

export default function TeacherMenu({
  teacherOpen,
  setTeacherOpen,
  setSidebarOpen,
}: TeacherMenuProps) {
  const location = useLocation();
  const isSectionActive = location.pathname.startsWith("/teacher");
  const itemClass =
    "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="relative">
      <button
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
          isSectionActive ? "bg-indigo-500 text-white" : ""
        )}
        onClick={() => setTeacherOpen((prev) => !prev)}
      >
        📊 Docente
        <span className="ml-2">{teacherOpen ? "▴" : "▾"}</span>
      </button>

      {teacherOpen && (
        <div className="ml-4 mt-1 space-y-1">
          <Link
            to="/teacher/dashboard"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/teacher/classrooms"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🏫 Mis aulas
          </Link>
        </div>
      )}
    </div>
  );
}

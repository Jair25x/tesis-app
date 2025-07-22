// src/layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useStudentView } from "../context/useStudentView";
import { cn } from "../utils/cn";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";

export default function MainLayout() {
  const { user } = useAuth();
  const { impersonateStudentView, setImpersonateStudentView } =
    useStudentView();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roles = user?.roles || [];
  const hideSidebar = location.pathname.startsWith("/student/practice");

  const toggleStudentView = () => {
    setImpersonateStudentView(!impersonateStudentView);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1e2a34] text-black dark:text-white transition-colors duration-300">
      {!hideSidebar && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ✅ Solo props necesarias */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        </>
      )}

      <div
        className={cn(
          "flex-1 flex flex-col h-full transition-margin duration-300",
          hideSidebar ? "ml-0" : "md:ml-64"
        )}
      >
        {/* ✅ Banner de "Ver como estudiante" */}
        {impersonateStudentView &&
          (roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN")) && (
            <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
              Estás viendo la plataforma como estudiante.
              <button
                onClick={toggleStudentView}
                className="underline font-medium text-yellow-900 ml-2"
              >
                Salir
              </button>
            </div>
          )}

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#1e2a34]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

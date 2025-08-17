// src/layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useStudentView } from "../context/useStudentView";
import { cn } from "../utils/cn";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import WhiteboardFloatingPanel from "../components/student/WhiteboardFloatingPanel";
import { useWhiteboard } from "../context/useWhiteboard";

export default function MainLayout() {
  const { user } = useAuth();
  const { impersonateStudentView, setImpersonateStudentView } =
    useStudentView();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roles = user?.roles || [];
  const isPlayer = location.pathname.startsWith("/student/exercises/");
  const hideSidebar = isPlayer; // ✅ ocultar solo en el reproductor
  const showMobileHeader = !hideSidebar;
  const toggleStudentView = () => {
    setImpersonateStudentView(!impersonateStudentView);
  };

  // 🧠 Control de pizarra desde el contexto
  const { isOpen, open, close } = useWhiteboard();

  // 🎯 Mostrar pizarra solo en estas rutas
  const showWhiteboard =
    location.pathname.startsWith("/student/exercises/") ||
    location.pathname.startsWith("/student/diagnostic");

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
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* 👇 Si tu MobileHeader es fixed, mantenlo y compensa en <main> */}
          <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        </>
      )}

      <div
        className={cn(
          "flex-1 flex flex-col h-full transition-margin duration-300",
          hideSidebar ? "ml-0" : "md:ml-64"
        )}
      >
        {/* Aviso de impersonación */}
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

        {/* 👇 Antes tenías `p-6`. Cambiamos a padding dinámico:
              - En móvil: deja espacio para el header (h-14 ≈ 56px => pt-14)
              - En md+: el header ya no es fijo, así que usamos padding normal */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1e2a34]",
            showMobileHeader ? "pt-14 px-4 pb-6 md:pt-6 md:px-6" : "p-6"
          )}
        >
          <Outlet />
        </main>

        {/* ✅ Botón flotante para abrir la pizarra */}
        {showWhiteboard && !isOpen && (
          <button
            onClick={open}
            data-tooltip-id="tooltip-pizarra"
            data-tooltip-content="Abrir pizarra de apoyo"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-transform hover:scale-105"
          >
            ✏️ Pizarra
          </button>
        )}

        {/* ✅ Mostrar la pizarra si corresponde */}
        {showWhiteboard && (
          <WhiteboardFloatingPanel isOpen={isOpen} onClose={close} />
        )}
      </div>
    </div>
  );
}

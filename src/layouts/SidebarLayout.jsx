import React, { useState } from "react";
import Sidebar from "../components/Shared/SideBar";
import { Outlet } from "react-router-dom";
import NotificacionBell from "../components/Shared/Notificaciones/NotificacionBell";
import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/Theme/useTheme";

const SidebarLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* 1. Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Contenedor Principal */}
      <main
        className={`
          flex flex-col flex-1 min-w-0 w-0 h-screen overflow-hidden relative
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}
          ${isMobileSidebarOpen ? 'pointer-events-none opacity-50 md:opacity-100 md:pointer-events-auto' : ''}
        `}
      >
        {/* CAMPANITA + TOGGLE TEMA */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-[30] flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className="
              w-9 h-9 flex items-center justify-center rounded-full
              bg-white dark:bg-dark-surface
              border border-slate-200 dark:border-dark-border
              text-brand-gold-dark dark:text-brand-gold
              shadow-sm hover:shadow-md
              hover:bg-slate-50 dark:hover:bg-dark-surface-alt
              transition-all duration-300
              active:scale-90
            "
          >
            {isDark ? (
              <Sun size={18} className="transition-transform duration-300" />
            ) : (
              <Moon size={18} className="transition-transform duration-300" />
            )}
          </button>

          <NotificacionBell />
        </div>

        {/* 3. Área de Contenido (Outlet) */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-dark-bg pt-16 md:pt-8 transition-colors duration-300">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
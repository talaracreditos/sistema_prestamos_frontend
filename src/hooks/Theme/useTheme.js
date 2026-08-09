import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "talara_theme"; // 'dark' | 'light'

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // si no hay nada guardado, respeta la preferencia del sistema
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Hook para manejar el tema claro/oscuro de la app.
 * - Aplica/remueve la clase "dark" en <html>
 * - Persiste la preferencia en localStorage
 * - Respeta el prefers-color-scheme del sistema si no hay nada guardado
 * - Se sincroniza entre pestañas (evento "storage")
 */
const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplica/remueve la clase "dark" en <html> y persiste en localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sincroniza el tema si se cambia en otra pestaña
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark = theme === "dark";

  return { theme, isDark, toggleTheme, setTheme };
};

export default useTheme;
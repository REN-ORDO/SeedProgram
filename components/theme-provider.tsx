"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "toon";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "toon",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark");
    root.classList.add("theme-toon");
    try {
      localStorage.setItem("cw-theme", "toon");
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "toon", toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

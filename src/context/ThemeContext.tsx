"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
export type AccentColor = "default" | "cyan" | "green" | "purple" | "red" | "orange";

export type BackgroundMode = "particles" | "matrix";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accents: Record<AccentColor, { primary: string; secondary: string }> = {
  default: { primary: "#2563eb", secondary: "#9333ea" }, // Blue -> Purple
  cyan: { primary: "#06b6d4", secondary: "#3b82f6" }, // Cyan -> Blue
  green: { primary: "#10b981", secondary: "#3b82f6" }, // Emerald -> Blue
  purple: { primary: "#a855f7", secondary: "#ec4899" }, // Purple -> Pink
  red: { primary: "#ef4444", secondary: "#f97316" }, // Red -> Orange
  orange: { primary: "#f97316", secondary: "#eab308" }, // Orange -> Yellow
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use lazy initializers to load from localStorage without triggering effects
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = localStorage.getItem("portfolio-theme") as Theme;
    return savedTheme || "dark";
  });

  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window === "undefined") return "default";
    const savedAccent = localStorage.getItem("portfolio-accent") as AccentColor;
    return savedAccent && accents[savedAccent] ? savedAccent : "default";
  });

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(() => {
    if (typeof window === "undefined") return "particles";
    const savedBgMode = localStorage.getItem("portfolio-bg-mode") as BackgroundMode;
    return savedBgMode || "particles";
  });

  useEffect(() => {
    // Update document class and save to localStorage
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    const colors = accents[accent];
    document.documentElement.style.setProperty("--accent-primary", colors.primary);
    document.documentElement.style.setProperty("--accent-secondary", colors.secondary);
    localStorage.setItem("portfolio-accent", accent);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem("portfolio-bg-mode", backgroundMode);
  }, [backgroundMode]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, accent, setAccent, backgroundMode, setBackgroundMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

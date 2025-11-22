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
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState<AccentColor>("default");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("particles");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    // Load theme and accent from localStorage
    const savedTheme = localStorage.getItem("portfolio-theme") as Theme;
    const savedAccent = localStorage.getItem("portfolio-accent") as AccentColor;
    const savedBgMode = localStorage.getItem("portfolio-bg-mode") as BackgroundMode;

    if (savedTheme) setTimeout(() => setTheme(savedTheme), 0);
    if (savedAccent && accents[savedAccent]) setTimeout(() => setAccent(savedAccent), 0);
    if (savedBgMode) setTimeout(() => setBackgroundMode(savedBgMode), 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Update document class and save to localStorage
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const colors = accents[accent];
    document.documentElement.style.setProperty("--accent-primary", colors.primary);
    document.documentElement.style.setProperty("--accent-secondary", colors.secondary);
    localStorage.setItem("portfolio-accent", accent);
  }, [accent, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("portfolio-bg-mode", backgroundMode);
  }, [backgroundMode, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, accent, setAccent, backgroundMode, setBackgroundMode }}
    >
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
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

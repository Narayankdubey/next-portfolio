"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MinimizedWindow {
  id: string;
  title: string;
  onRestore: () => void;
}

interface MinimizedWindowsContextType {
  windows: MinimizedWindow[];
  addWindow: (window: MinimizedWindow) => void;
  removeWindow: (id: string) => void;
  getPosition: (id: string) => { bottom: string; right: string };
}

const MinimizedWindowsContext = createContext<MinimizedWindowsContextType | undefined>(undefined);

export function MinimizedWindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<MinimizedWindow[]>([]);

  const addWindow = (window: MinimizedWindow) => {
    setWindows((prev) => {
      // Remove if already exists, then add to end
      const filtered = prev.filter((w) => w.id !== window.id);
      return [...filtered, window];
    });
  };

  const removeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const getPosition = (id: string) => {
    const index = windows.findIndex((w) => w.id === id);
    if (index === -1) return { bottom: "1rem", right: "1rem" };

    // Stack vertically with 4px gap between each
    const bottomOffset = 1 + index * 3.5; // 1rem base + 3.5rem per window (56px height + gap)
    return {
      bottom: `${bottomOffset}rem`,
      right: "1rem",
    };
  };

  return (
    <MinimizedWindowsContext.Provider value={{ windows, addWindow, removeWindow, getPosition }}>
      {children}
    </MinimizedWindowsContext.Provider>
  );
}

export function useMinimizedWindows() {
  const context = useContext(MinimizedWindowsContext);
  if (context === undefined) {
    throw new Error("useMinimizedWindows must be used within MinimizedWindowsProvider");
  }
  return context;
}

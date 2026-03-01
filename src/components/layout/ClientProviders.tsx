"use client";

import { MinimizedWindowsProvider } from "@/context/MinimizedWindowsContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MinimizedWindowsProvider>{children}</MinimizedWindowsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

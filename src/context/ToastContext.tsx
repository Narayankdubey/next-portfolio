"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3000) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const showError = useCallback(
    (message: string) => showToast(message, "error", 4000),
    [showToast]
  );
  const showInfo = useCallback((message: string) => showToast(message, "info"), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, "warning"), [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/90 dark:bg-emerald-600/90 text-white border-emerald-400";
      case "error":
        return "bg-red-500/90 dark:bg-red-600/90 text-white border-red-400";
      case "warning":
        return "bg-yellow-500/90 dark:bg-yellow-600/90 text-white border-yellow-400";
      case "info":
      default:
        return "bg-blue-500/90 dark:bg-blue-600/90 text-white border-blue-400";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`
                pointer-events-auto
                flex items-center gap-3 px-4 py-3 rounded-lg
                border-2 shadow-2xl backdrop-blur-md
                min-w-[300px] max-w-[400px]
                ${getToastStyles(toast.type)}
              `}
            >
              {getToastIcon(toast.type)}
              <span className="flex-1 font-medium text-sm">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress bar */}
              {toast.duration && toast.duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: toast.duration / 1000, ease: "linear" }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Palette, X, Check } from "lucide-react";
import { useTheme, AccentColor } from "@/context/ThemeContext";
import { useAnalytics } from "@/context/AnalyticsContext";

const colors: { id: AccentColor; name: string; color: string }[] = [
  { id: "default", name: "Royal Blue", color: "#2563eb" },
  { id: "cyan", name: "Cyber Cyan", color: "#06b6d4" },
  { id: "green", name: "Matrix Green", color: "#10b981" },
  { id: "purple", name: "Neon Purple", color: "#a855f7" },
  { id: "red", name: "Red Alert", color: "#ef4444" },
  { id: "orange", name: "Sunset Orange", color: "#f97316" },
];

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { accent, setAccent, backgroundMode, setBackgroundMode } = useTheme();
  const { trackAction } = useAnalytics();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                trackAction("click", "modal-close", {
                  modalId: "theme-customizer",
                  title: "Theme Customizer",
                });
                onClose();
              }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, x: -20 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: 0 }}
              exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed z-50 p-4 theme-card border theme-border shadow-2xl ${
                isMobile
                  ? "bottom-0 left-0 right-0 w-full rounded-t-2xl border-b-0"
                  : "left-4 top-24 w-72 rounded-2xl"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold theme-text flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
                  System Appearance
                </h3>
                <button
                  onClick={() => {
                    trackAction("click", "modal-close", {
                      modalId: "theme-customizer",
                      title: "Theme Customizer",
                    });
                    onClose();
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 theme-text-secondary" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium theme-text-secondary mb-2 block">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setAccent(c.id);
                          trackAction("change", "theme-customizer", {
                            setting: "accent",
                            value: c.id,
                          });
                        }}
                        className={`relative h-10 rounded-lg transition-all hover:scale-105 cursor-pointer border-2 ${
                          accent === c.id
                            ? "border-[var(--accent-primary)]"
                            : "border-transparent hover:border-white/20"
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      >
                        {accent === c.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs theme-text-secondary">
                  <p>
                    Selected:{" "}
                    <span className="font-medium theme-text">
                      {colors.find((c) => c.id === accent)?.name}
                    </span>
                  </p>
                  <p className="mt-1 opacity-70">
                    This will update buttons, gradients, and highlights across the system.
                  </p>
                </div>

                <div className="pt-4 border-t theme-border">
                  <label className="text-xs font-medium theme-text-secondary mb-2 block">
                    Background Effect
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setBackgroundMode("particles");
                        trackAction("change", "theme-customizer", {
                          setting: "background",
                          value: "particles",
                        });
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        backgroundMode === "particles"
                          ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                          : "theme-card theme-border theme-text hover:border-[var(--accent-primary)]"
                      }`}
                    >
                      Particles
                    </button>
                    <button
                      onClick={() => {
                        setBackgroundMode("matrix");
                        trackAction("change", "theme-customizer", {
                          setting: "background",
                          value: "matrix",
                        });
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        backgroundMode === "matrix"
                          ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                          : "theme-card theme-border theme-text hover:border-[var(--accent-primary)]"
                      }`}
                    >
                      Matrix Rain
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

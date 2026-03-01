"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modals/overlays" },
      { keys: ["↑", "↓"], description: "Navigate items" },
    ],
  },
  {
    category: "Apps & Tools",
    items: [
      { keys: ["⌘", "T"], description: "Toggle terminal" },
      { keys: ["⌘", "S"], description: "Open search" },
      { keys: ["⌘", "M"], description: "Open mobile preview" },
      { keys: ["⌘", "D"], description: "Toggle theme" },
    ],
  },
  {
    category: "Window Control",
    items: [
      { keys: ["⌘", "↓"], description: "Minimize window" },
      { keys: ["⌘", "↑"], description: "Maximize window" },
      { keys: ["⌘", "W"], description: "Close window" },
    ],
  },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with '?'
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-3xl mx-4"
          >
            <div className="theme-bg border-2 theme-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b theme-border bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-xl font-bold theme-text">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 theme-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-6">
                  {shortcuts.map((section) => (
                    <div key={section.category}>
                      <h3 className="text-sm font-semibold text-emerald-500 mb-3 uppercase tracking-wide">
                        {section.category}
                      </h3>
                      <div className="grid gap-2">
                        {section.items.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="theme-text-secondary text-sm">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIdx) => (
                                <kbd
                                  key={keyIdx}
                                  className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 theme-text border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[28px] text-center"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer hint */}
                <div className="mt-6 pt-6 border-t theme-border">
                  <p className="text-xs theme-text-secondary text-center">
                    Press{" "}
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 theme-text border border-gray-300 dark:border-gray-600 rounded">
                      ?
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 theme-text border border-gray-300 dark:border-gray-600 rounded">
                      Esc
                    </kbd>{" "}
                    to close
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

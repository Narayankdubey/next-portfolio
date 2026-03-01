"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Terminal,
  Palette,
  Smartphone,
  Code,
  User,
  Briefcase,
  Mail,
  Home,
  FileText,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: typeof Search;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  onOpenTerminal?: () => void;
  onOpenSearch?: () => void;
  onOpenMobile?: () => void;
  onOpenTechStack?: () => void;
  onToggleTheme?: () => void;
}

export default function CommandPalette({
  onOpenTerminal,
  onOpenSearch,
  onOpenMobile,
  onOpenTechStack,
  onToggleTheme,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const commands: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: "home",
        label: "Go to Home",
        icon: Home,
        action: () => scrollToSection("home"),
        category: "Navigation",
      },
      {
        id: "about",
        label: "Go to About",
        icon: User,
        action: () => scrollToSection("about"),
        category: "Navigation",
      },
      {
        id: "experience",
        label: "Go to Experience",
        icon: Briefcase,
        action: () => scrollToSection("experience"),
        category: "Navigation",
      },
      {
        id: "contact",
        label: "Go to Contact",
        icon: Mail,
        action: () => scrollToSection("contact"),
        category: "Navigation",
      },

      // Apps
      {
        id: "terminal",
        label: "Open Terminal",
        icon: Terminal,
        action: () => onOpenTerminal?.(),
        category: "Apps",
        keywords: ["cmd", "command", "shell"],
      },
      {
        id: "search",
        label: "Open Search",
        icon: Search,
        action: () => onOpenSearch?.(),
        category: "Apps",
        keywords: ["find"],
      },
      {
        id: "mobile",
        label: "Mobile Preview",
        icon: Smartphone,
        action: () => onOpenMobile?.(),
        category: "Apps",
        keywords: ["phone", "responsive"],
      },
      {
        id: "tech",
        label: "Tech Stack Visualizer",
        icon: Code,
        action: () => onOpenTechStack?.(),
        category: "Apps",
        keywords: ["skills", "technologies"],
      },

      // Actions
      {
        id: "theme",
        label: "Toggle Theme",
        icon: Palette,
        action: () => onToggleTheme?.(),
        category: "Actions",
        keywords: ["dark", "light", "mode"],
      },
      {
        id: "resume",
        label: "View Resume",
        icon: FileText,
        action: () => window.open("/resume", "_blank"),
        category: "Actions",
        keywords: ["cv", "pdf"],
      },
    ],
    [onOpenTerminal, onOpenSearch, onOpenMobile, onOpenTechStack, onToggleTheme]
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      setQuery("");
    }
  };

  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(lowerQuery);
      const categoryMatch = cmd.category.toLowerCase().includes(lowerQuery);
      const keywordsMatch = cmd.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery));
      return labelMatch || categoryMatch || keywordsMatch;
    });
  }, [query, commands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
      }

      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Reset selected index when query changes
  useEffect(() => {
    setTimeout(() => setSelectedIndex(0), 0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-2xl mx-4"
          >
            <div className="theme-bg border-2 theme-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b theme-border bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
                <Search className="w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent theme-text outline-none text-sm placeholder:theme-text-secondary"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 theme-text-secondary border border-gray-300 dark:border-gray-600 rounded">
                  Esc
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center theme-text-secondary">
                    No commands found for &quot;{query}&quot;
                  </div>
                ) : (
                  <div className="py-2">
                    {Object.entries(
                      filteredCommands.reduce(
                        (acc, cmd) => {
                          if (!acc[cmd.category]) acc[cmd.category] = [];
                          acc[cmd.category].push(cmd);
                          return acc;
                        },
                        {} as Record<string, Command[]>
                      )
                    ).map(([category, cmds]) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
                            {category}
                          </h3>
                        </div>
                        {cmds.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          const Icon = cmd.icon;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                                setQuery("");
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                                ${
                                  globalIndex === selectedIndex
                                    ? "bg-emerald-500/20 border-l-4 border-emerald-500"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent"
                                }
                              `}
                            >
                              <Icon className="w-5 h-5 theme-text-secondary" />
                              <span className="flex-1 theme-text text-sm font-medium">
                                {cmd.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t theme-border bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between text-xs theme-text-secondary">
                  <span>Navigate with ↑↓ • Select with Enter</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
                    to toggle
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

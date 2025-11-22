"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, FileCode, Briefcase, Code2, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import DraggableModal from "./DraggableModal";

interface SearchResult {
  type: "project" | "skill" | "experience";
  title: string;
  description: string;
  href: string;
  category?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const portfolio = usePortfolio();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const element = document.querySelector(result.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        onClose();
      }
    },
    [onClose]
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
        setSelectedIndex(0);
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectResult]);

  // Search logic
  useEffect(() => {
    if (!query.trim() || !portfolio) {
      setTimeout(() => setResults([]), 0);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search projects
    portfolio.projects.forEach((project) => {
      if (
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          type: "project",
          title: project.title,
          description: project.description,
          href: "#projects",
        });
      }
    });

    // Search skills
    Object.entries(portfolio.skills).forEach(([category, skills]) => {
      (skills as string[]).forEach((skill) => {
        if (skill.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            type: "skill",
            title: skill,
            description: `${category.charAt(0).toUpperCase() + category.slice(1)} skill`,
            href: "#about",
            category,
          });
        }
      });
    });

    // Search experience
    portfolio.experience.forEach((exp) => {
      if (
        exp.company.toLowerCase().includes(lowerQuery) ||
        exp.role.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: "experience",
          title: `${exp.role} at ${exp.company}`,
          description: exp.period,
          href: "#experience",
        });
      }
    });

    setTimeout(() => setResults(searchResults.slice(0, 10)), 0);
    setTimeout(() => setSelectedIndex(0), 0);
  }, [query, portfolio]);

  const getIcon = (type: string) => {
    switch (type) {
      case "project":
        return FileCode;
      case "experience":
        return Briefcase;
      case "skill":
        return Code2;
      default:
        return Search;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <DraggableModal
          windowId="search"
          isOpen={isOpen}
          onClose={onClose}
          title="Search"
          defaultWidth={600}
          defaultHeight={500}
          minWidth={500}
          minHeight={400}
        >
          <div className="flex flex-col h-full">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b theme-border">
              <Search className="w-5 h-5 theme-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, skills, experience..."
                className="flex-1 bg-transparent border-none outline-none theme-text text-lg placeholder-gray-500"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {results.length === 0 && query && (
                <div className="p-8 text-center theme-text-secondary">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {results.length === 0 && !query && (
                <div className="p-8 text-center theme-text-secondary">
                  <p className="mb-2">Quick Search</p>
                  <p className="text-sm">Search for projects, skills, or experience</p>
                </div>
              )}

              {results.map((result, index) => {
                const Icon = getIcon(result.type);
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full flex items-center gap-4 p-4 border-b theme-border transition-colors ${
                      index === selectedIndex ? "theme-card" : "hover:theme-card"
                    }`}
                  >
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="theme-text font-medium">{result.title}</p>
                      <p className="text-sm theme-text-secondary">{result.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 theme-text-secondary" />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t theme-border theme-card">
              <div className="flex items-center gap-4 text-xs theme-text-secondary">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 theme-card border theme-border rounded text-xs">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 theme-card border theme-border rounded text-xs">↵</kbd>
                  Select
                </span>
              </div>
            </div>
          </div>
        </DraggableModal>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select...",
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const isAllSelected = selectedValues.length === options.length && options.length > 0;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Target input replacement */}
      <div
        className="flex items-center justify-between pl-3 pr-8 py-1.5 bg-gray-900/50 text-gray-300 border border-gray-700 rounded-lg text-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 cursor-pointer outline-none hover:bg-gray-800 transition-colors min-h-[34px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-4 flex items-center gap-1.5 w-full">
          <span className="text-gray-400 shrink-0">{label}:</span>
          {selectedValues.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : isAllSelected ? (
            <span className="text-blue-400 font-medium truncate">All</span>
          ) : (
            <span className="text-gray-200 truncate font-medium">
              {selectedValues.length} selected
            </span>
          )}
        </span>

        {/* Action Icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-transparent">
          {selectedValues.length > 0 && (
            <button
              onClick={clearAll}
              className="p-0.5 text-gray-500 hover:text-red-400 hover:bg-red-400/20 rounded-full transition-colors mr-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Flyout Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full min-w-[200px] mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-[250px] overflow-y-auto w-full overscroll-contain">
              <div
                className="px-3 py-2 border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer flex items-center justify-between text-sm transition-colors text-blue-400 font-medium"
                onClick={() => onChange(isAllSelected ? [] : [...options])}
              >
                <span>Select All</span>
                {isAllSelected && <Check className="w-4 h-4 text-blue-400" />}
              </div>

              {options.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500 italic">
                  No options available
                </div>
              )}

              {options.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div
                    key={option}
                    className="px-3 py-2 block hover:bg-gray-700/50 cursor-pointer flex items-center justify-between text-sm transition-colors group"
                    onClick={() => toggleOption(option)}
                  >
                    <span
                      className={`truncate w-[85%] ${isSelected ? "text-gray-200 font-medium" : "text-gray-400"}`}
                    >
                      {option || "Unknown"}
                    </span>
                    <div className="w-[15%] flex justify-end">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-gray-600 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

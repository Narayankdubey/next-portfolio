"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";

export default function FeatureFlagsDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const flags = useFeatureFlags();

  if (!flags.devMode.showFeatureToggles) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[9999] p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
        title="Feature Flags"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 bottom-20 z-[9999] w-80 max-h-[70vh] overflow-y-auto bg-gray-900 border-2 border-purple-500 rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-purple-500 p-4 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Feature Flags
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Sections */}
              <div>
                <h4 className="text-purple-400 font-semibold mb-2 text-sm">Sections</h4>
                <div className="space-y-1">
                  {Object.entries(flags.sections).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded"
                    >
                      <span className="text-gray-300 text-sm capitalize">{key}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${value ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                      >
                        {value ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-purple-400 font-semibold mb-2 text-sm">Features</h4>
                <div className="space-y-1">
                  {Object.entries(flags.features).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded"
                    >
                      <span className="text-gray-300 text-sm capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${value ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                      >
                        {value ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

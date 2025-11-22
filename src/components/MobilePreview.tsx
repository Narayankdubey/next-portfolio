"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import DraggableModal from "./DraggableModal";

interface MobilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample mobile app data
const mobileApps = [
  {
    name: "Portfolio Mobile",
    platform: "iOS",
    screenshots: [
      { id: 1, gradient: "from-blue-500 via-purple-500 to-pink-500" },
      { id: 2, gradient: "from-green-500 via-emerald-500 to-cyan-500" },
      { id: 3, gradient: "from-orange-500 via-red-500 to-pink-500" },
    ],
  },
];

export default function MobilePreview({ isOpen, onClose }: MobilePreviewProps) {
  const [currentApp] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(0);

  const app = mobileApps[currentApp];

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev === app.screenshots.length - 1 ? 0 : prev + 1));
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev === 0 ? app.screenshots.length - 1 : prev - 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <DraggableModal
          windowId="mobile-preview"
          isOpen={isOpen}
          onClose={onClose}
          title={`${app.name} - ${app.platform}`}
          defaultWidth={400}
          defaultHeight={700}
          minWidth={350}
          minHeight={600}
        >
          <div className="p-8 flex flex-col items-center">
            {/* Phone Frame with Screenshot */}
            <div className="flex items-center justify-center gap-8">
              {/* Previous Button */}
              <button
                onClick={prevScreen}
                className="p-3 theme-card border theme-border rounded-full hover:border-blue-500 transition-colors cursor-pointer"
                disabled={app.screenshots.length <= 1}
              >
                <ChevronLeft className="w-6 h-6 theme-text" />
              </button>

              {/* Phone Frame */}
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, rotateY: -20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 20 }}
                className="relative"
              >
                {/* Phone outer frame */}
                <div className="relative w-80 h-[550px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl border-8 border-gray-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10" />

                  {/* Screen */}
                  <div
                    className={`relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${app.screenshots[currentScreen].gradient} flex items-center justify-center`}
                  >
                    <div className="text-center p-8">
                      <div className="text-white text-6xl font-bold mb-4">{currentScreen + 1}</div>
                      <div className="text-white/80 text-lg">{app.name}</div>
                      <div className="text-white/60 text-sm mt-2">{app.platform} App</div>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
                </div>

                {/* Screen counter */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {app.screenshots.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreen(index)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        index === currentScreen ? "bg-blue-500 w-6" : "bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={nextScreen}
                className="p-3 theme-card border theme-border rounded-full hover:border-blue-500 transition-colors cursor-pointer"
                disabled={app.screenshots.length <= 1}
              >
                <ChevronRight className="w-6 h-6 theme-text" />
              </button>
            </div>

            {/* Info */}
            <div className="mt-12 text-center">
              <p className="theme-text-secondary text-sm">
                Screen {currentScreen + 1} of {app.screenshots.length}
              </p>
              <p className="theme-text-secondary text-xs mt-2">Use arrow buttons to navigate</p>
            </div>
          </div>
        </DraggableModal>
      )}
    </AnimatePresence>
  );
}

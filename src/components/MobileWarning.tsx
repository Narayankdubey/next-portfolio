"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X } from "lucide-react";

export default function MobileWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user is on mobile and hasn't dismissed the warning
    const dismissed = localStorage.getItem("mobileWarningDismissed");
    const isMobile = window.innerWidth < 1024; // Show on screens smaller than lg

    if (isMobile && !dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("mobileWarningDismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] lg:hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
            <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
              <div className="flex items-center gap-3 flex-1">
                <Monitor className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  For the best experience, please view on a larger screen
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  { threshold: 10, text: "Nice clicking! 🖱️" },
  { threshold: 50, text: "You're on fire! 🔥" },
  { threshold: 100, text: "Click master! 💯" },
  { threshold: 500, text: "Legendary clicker! 👑" },
  { threshold: 1000, text: "Are you a robot? 🤖" },
];

export default function ClickCounter() {
  const [clickCount, setClickCount] = useState(0);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [shownMilestones, setShownMilestones] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleClick = () => {
      setClickCount((prev) => prev + 1);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const milestone = messages.find(
      (m) => clickCount >= m.threshold && !shownMilestones.has(m.threshold)
    );

    if (milestone) {
      setTimeout(() => {
        setShowMessage(milestone.text);
        setShownMilestones((prev) => new Set([...prev, milestone.threshold]));
      }, 0);
      setTimeout(() => setShowMessage(null), 3000);
    }
  }, [clickCount, shownMilestones]);

  return (
    <>
      {/* Click counter badge (only visible in dev or on special key press) */}
      <div className="fixed bottom-4 left-4 opacity-20 hover:opacity-100 transition-opacity text-xs theme-text-secondary z-50">
        Clicks: {clickCount}
      </div>

      {/* Milestone messages */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center border-4 border-white"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-2xl font-bold">{showMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

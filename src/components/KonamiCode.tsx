"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Matrix rain effect
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    let animationId: number;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};

interface KonamiCodeProps {
  onActivate?: () => void;
}

const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export default function KonamiCode({ onActivate }: KonamiCodeProps) {
  const [isActive, setIsActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const sequenceRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      sequenceRef.current.push(e.code);

      // Keep only last 10 keys
      if (sequenceRef.current.length > 10) {
        sequenceRef.current.shift();
      }

      // Check if sequence matches
      const matches = konamiSequence.every((key, idx) => sequenceRef.current[idx] === key);

      if (matches) {
        setIsActive(true);
        setShowHint(false);
        onActivate?.();
        sequenceRef.current = [];

        // Auto-close after 10 seconds
        setTimeout(() => setIsActive(false), 10000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Show hint after 30 seconds
    const hintTimer = setTimeout(() => setShowHint(true), 30000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(hintTimer);
    };
  }, [onActivate]);

  return (
    <>
      {/* Matrix Effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9996] pointer-events-none"
          >
            <MatrixRain />

            {/* Achievement Notification */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 border-4 border-emerald-500 rounded-2xl p-8 text-center pointer-events-auto"
            >
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold text-emerald-500 mb-2">KONAMI CODE ACTIVATED!</h2>
              <p className="text-emerald-400 mb-4">You&apos;ve unlocked the Matrix!</p>
              <button
                onClick={() => setIsActive(false)}
                className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Exit Matrix
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <AnimatePresence>
        {showHint && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-4 bg-black/80 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/50 z-50"
          >
            <p>Try: ↑↑↓↓←→←→BA</p>
            <button
              onClick={() => setShowHint(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full text-black text-xs font-bold"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

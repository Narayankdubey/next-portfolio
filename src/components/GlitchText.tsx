"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export default function GlitchText({
  text,
  className = "",
  as: Component = "span",
}: GlitchTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Component
      className={`relative inline-block group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">{text}</span>

      {/* Glitch Layers - Always visible, enhanced on hover */}
      <span
        className={`absolute top-0 left-0 -z-10 w-full h-full text-[var(--accent-primary)] opacity-0 group-hover:opacity-70 transition-opacity duration-100`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
          transform: isHovered ? "translate(-2px, -2px)" : "none",
        }}
        aria-hidden="true"
      >
        {text}
      </span>

      <span
        className={`absolute top-0 left-0 -z-10 w-full h-full text-[var(--accent-secondary)] opacity-0 group-hover:opacity-70 transition-opacity duration-100`}
        style={{
          clipPath: "polygon(0 80%, 100% 20%, 100% 100%, 0 100%)",
          transform: isHovered ? "translate(2px, 2px)" : "none",
        }}
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Random Glitch Animation Elements */}
      {isHovered && (
        <>
          <motion.span
            className="absolute top-0 left-0 w-full h-full bg-[var(--accent-primary)] opacity-20"
            initial={{ clipPath: "inset(0 0 0 0)" }}
            animate={{
              clipPath: [
                "inset(20% 0 80% 0)",
                "inset(60% 0 10% 0)",
                "inset(40% 0 50% 0)",
                "inset(80% 0 5% 0)",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.2,
              repeatType: "mirror",
            }}
          />
        </>
      )}
    </Component>
  );
}

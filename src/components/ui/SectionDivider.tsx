"use client";

import { motion } from "framer-motion";
import { Code, ChevronRight, Braces } from "lucide-react";

interface SectionDividerProps {
  variant?: "default" | "code" | "arrow";
}

export default function SectionDivider({ variant = "default" }: SectionDividerProps) {
  if (variant === "code") {
    return (
      <div className="relative py-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <Code className="w-6 h-6 text-emerald-500" />
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <Braces className="w-6 h-6 text-cyan-500" />
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <Code className="w-6 h-6 text-blue-500" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === "arrow") {
    return (
      <div className="relative py-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            {[...Array(5)].map((_, i) => (
              <ChevronRight
                key={i}
                className="w-4 h-4 text-emerald-500"
                style={{ opacity: 1 - i * 0.2 }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-16">
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
      />
    </div>
  );
}

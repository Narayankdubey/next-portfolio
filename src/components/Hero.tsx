"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, Code2 } from "lucide-react";
import Image from "next/image";
import { usePortfolio } from "@/context/PortfolioContext";
import GlitchText from "./GlitchText";

interface HeroProps {
  terminalOpen: boolean;
  terminalState: "normal" | "minimized" | "maximized";
  onTerminalClick: () => void;
}

export default function Hero({ terminalOpen, terminalState, onTerminalClick }: HeroProps) {
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  const { personal, social } = portfolio;

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center place-items-center lg:place-items-start">
      {/* Left side - Hero content */}
      <div className="flex flex-col justify-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-48 h-48 mx-auto lg:mx-0"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-60 animate-pulse" />
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20">
            <Image src={personal.profileImage} alt={personal.name} fill className="object-cover" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <GlitchText
              text={personal.name}
              as="h1"
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl md:text-3xl text-gray-300 font-light"
          >
            {personal.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl"
          >
            {personal.tagline}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap gap-6 items-center"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{personal.location}</span>
          </div>

          <div className="h-6 w-px bg-gray-700" />

          <div className="flex gap-3">
            <motion.a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`mailto:${social.email}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
          }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 20px 35px -5px rgba(37, 99, 235, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
          }
          className="w-fit px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white cursor-pointer relative overflow-hidden group"
        >
          <span className="relative z-10">View My Work</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </div>

      {/* Right side - Animated code snippet (hidden when terminal is open and not minimized) */}
      <AnimatePresence>
        {(!terminalOpen || terminalState === "minimized") && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center cursor-pointer"
            onClick={onTerminalClick}
          >
            <motion.div
              className="relative max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl" />

              {/* Code container */}
              <div className="relative theme-terminal-bg backdrop-blur-sm border-2 theme-border hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b theme-border">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-mono text-emerald-400">developer.ts</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-emerald-500/70 hover:text-emerald-400 transition-colors">
                      Click to open terminal
                    </span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                  </div>
                </div>

                {/* Code content */}
                <pre className="font-mono text-sm leading-relaxed theme-text">
                  <code>
                    <span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400">developer</span>{" "}
                    <span className="theme-text-secondary">=</span>{" "}
                    <span className="text-yellow-600 dark:text-yellow-400">{"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-cyan-600 dark:text-cyan-400">name</span>
                    <span className="theme-text-secondary">:</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      &quot;{personal.name}&quot;
                    </span>
                    <span className="theme-text-secondary">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-cyan-600 dark:text-cyan-400">role</span>
                    <span className="theme-text-secondary">:</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      &quot;{personal.title}&quot;
                    </span>
                    <span className="theme-text-secondary">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-cyan-600 dark:text-cyan-400">location</span>
                    <span className="theme-text-secondary">:</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      &quot;{personal.location}&quot;
                    </span>
                    <span className="theme-text-secondary">,</span>
                    {"\n\n"}
                    {"  "}
                    <span className="text-cyan-600 dark:text-cyan-400">passion</span>
                    <span className="theme-text-secondary">:</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      &quot;Building amazing experiences ✨&quot;
                    </span>
                    {"\n"}
                    <span className="text-yellow-600 dark:text-yellow-400">{"}"}</span>
                    <span className="theme-text-secondary">;</span>
                    {"\n\n"}
                    <span className="text-blue-600 dark:text-blue-400">console</span>
                    <span className="theme-text-secondary">.</span>
                    <span className="text-yellow-600 dark:text-yellow-400">log</span>
                    <span className="theme-text-secondary">(</span>
                    <span className="text-blue-600 dark:text-blue-400">developer</span>
                    <span className="theme-text-secondary">.</span>
                    <span className="text-cyan-600 dark:text-cyan-400">passion</span>
                    <span className="theme-text-secondary">);</span>
                  </code>
                </pre>

                {/* Output */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 pt-3 border-t theme-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">❯</span>
                    <span className="text-emerald-400 text-sm">
                      Building amazing experiences ✨
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

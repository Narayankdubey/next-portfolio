"use client";

import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  // Code2, // Unused now
  Search,
  Terminal,
  Smartphone,
  Layers,
  MessageSquare,
  Music,
  Palette,
  FileText,
  Gamepad2,
  Sparkles,
  Settings2,
} from "lucide-react";
import Image from "next/image";
// import Link from "next/link"; // Unused now
import { usePortfolio } from "@/context/PortfolioContext";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import GlitchText from "./GlitchText";

interface HeroProps {
  terminalOpen: boolean;
  terminalState: "normal" | "minimized" | "maximized";
  onTerminalClick: () => void;
  onToggleSearch: () => void;
  onToggleMobilePreview: () => void;
  onToggleTechVisualizer: () => void;
  onToggleChatbot: () => void;
  onToggleMusic: () => void;
  onToggleTheme: () => void;
  onTriggerGame: () => void;
  onTriggerSurprise: () => void;
  onToggleSettings?: () => void;
}

export default function Hero({
  onTerminalClick,
  onToggleSearch,
  onToggleMobilePreview,
  onToggleTechVisualizer,
  onToggleChatbot,
  onToggleMusic,
  onToggleTheme,
  onTriggerGame,
  onTriggerSurprise,
  onToggleSettings,
}: HeroProps) {
  const portfolio = usePortfolio();
  const flags = useFeatureFlags();
  const { trackAction } = useAnalytics();

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
            className="text-2xl md:text-3xl theme-text font-light"
          >
            {personal.title}
          </motion.h2>

          {/* Open to Work Badge */}
          {flags.features.openToWork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">Open to Work</span>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg theme-text-secondary max-w-2xl"
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
          <div className="flex items-center gap-2 theme-text-secondary">
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
              onClick={() => trackAction("click", "hero-social", { platform: "github" })}
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
              onClick={() => trackAction("click", "hero-social", { platform: "linkedin" })}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`mailto:${social.email}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => trackAction("click", "hero-social", { platform: "mail" })}
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
          onClick={() => {
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            trackAction("click", "hero-cta", { label: "view-my-work" });
          }}
          className="w-fit px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white cursor-pointer relative overflow-hidden group"
        >
          <span className="relative z-10">View My Work</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </div>

      {/* Right side - Animated code snippet (hidden when terminal is open and not minimized) */}
      {/* Right side - Navigation Menu */}
      {/* Right side - App Launcher */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex justify-center w-full"
      >
        <div className="w-full max-w-sm">
          <div className="relative theme-card backdrop-blur-sm border theme-border rounded-2xl p-6 shadow-2xl theme-shadow">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quick Actions
            </h3>

            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  name: "Search",
                  icon: Search,
                  onClick: onToggleSearch,
                  gradient: "from-blue-500 via-indigo-500 to-purple-500",
                  enabled: flags.features.searchModal,
                },
                {
                  name: "Terminal",
                  icon: Terminal,
                  onClick: onTerminalClick,
                  gradient: "from-purple-500 via-pink-500 to-red-500",
                  enabled: flags.features.floatingTerminal,
                },
                {
                  name: "Mobile",
                  icon: Smartphone,
                  onClick: onToggleMobilePreview,
                  gradient: "from-pink-500 via-rose-500 to-orange-500",
                  enabled: flags.features.mobilePreview,
                },
                {
                  name: "Tech",
                  icon: Layers,
                  onClick: onToggleTechVisualizer,
                  gradient: "from-green-500 via-emerald-500 to-cyan-500",
                  enabled: flags.features.techVisualizer,
                },
                {
                  name: "Resume",
                  icon: FileText,
                  onClick: portfolio.resumeUrl
                    ? () => window.open(portfolio.resumeUrl, "_blank")
                    : () => {},
                  gradient: "from-yellow-500 via-orange-500 to-red-500",
                  enabled: !!portfolio.resumeUrl,
                },
                {
                  name: "Arcade",
                  icon: Gamepad2,
                  onClick: onTriggerGame,
                  gradient: "from-red-500 via-pink-500 to-purple-500",
                  enabled: true,
                },
                {
                  name: "Surprise",
                  icon: Sparkles,
                  onClick: onTriggerSurprise,
                  gradient: "from-indigo-500 via-purple-500 to-pink-500",
                  enabled: true,
                },
                {
                  name: "Settings",
                  icon: Settings2,
                  onClick: onToggleSettings,
                  gradient: "from-gray-600 via-gray-500 to-gray-400",
                  enabled: true,
                },
                {
                  name: "Chat AI",
                  icon: MessageSquare,
                  onClick: onToggleChatbot,
                  gradient: "from-blue-600 via-indigo-600 to-purple-600",
                  enabled: flags.features.chatbot,
                  highlight: true, // Special styling
                },
                {
                  name: "Music",
                  icon: Music,
                  onClick: onToggleMusic,
                  gradient: "from-green-500 via-emerald-500 to-teal-500",
                  enabled: flags.features.musicPlayer,
                },
                {
                  name: "Appearance",
                  icon: Palette,
                  onClick: onToggleTheme,
                  gradient: "from-orange-500 via-amber-500 to-yellow-500",
                  enabled: flags.features.themeCustomizer,
                },
              ]
                .filter((app) => app.enabled)
                .map((app) => {
                  const Icon = app.icon;
                  return (
                    <motion.button
                      key={app.name}
                      onClick={() => {
                        app.onClick();
                        trackAction("click", "hero-quick-action", { action: app.name });
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative flex flex-col items-center justify-center gap-2 ${
                        app.highlight ? "col-span-2" : ""
                      }`}
                    >
                      <div
                        className={`relative rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 ring-1 ring-white/10 group-hover:ring-white/30 
                        ${
                          app.highlight
                            ? "w-full h-16 flex items-center justify-center gap-3"
                            : "w-12 h-12 flex items-center justify-center"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
                        />

                        {/* Glassy reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <Icon
                            className={`${
                              app.highlight ? "w-6 h-6" : "w-6 h-6"
                            } text-white drop-shadow-md`}
                          />

                          {app.highlight && (
                            <span className="text-white font-bold text-sm uppercase tracking-wide">
                              {app.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Only show text below for non-highlighted items */}
                      {!app.highlight && (
                        <span className="text-[10px] font-bold uppercase tracking-wider theme-text-secondary group-hover:text-blue-400 transition-colors">
                          {app.name}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

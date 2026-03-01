"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Terminal,
  Smartphone,
  Layers,
  MessageSquare,
  Music,
  Palette,
  Settings2,
} from "lucide-react";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import { useAnalytics } from "@/context/AnalyticsContext";

interface AppBarProps {
  onToggleSearch: () => void;
  onToggleTerminal: () => void;
  onToggleMobilePreview: () => void;
  onToggleTechVisualizer: () => void;
  onToggleChatbot: () => void;
  onToggleMusic: () => void;
  onToggleTheme: () => void;
  onToggleSettings?: () => void;
}

export default function AppBar({
  onToggleSearch,
  onToggleTerminal,
  onToggleMobilePreview,
  onToggleTechVisualizer,
  onToggleChatbot,
  onToggleMusic,
  onToggleTheme,
  onToggleSettings,
}: AppBarProps) {
  const flags = useFeatureFlags();
  const { trackAction } = useAnalytics();

  const apps = [
    {
      name: "Search",
      icon: Search,
      onClick: onToggleSearch,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      isActive: false,
      tooltip: "Search (⌘K)",
      enabled: flags.features.searchModal,
    },
    {
      name: "Terminal",
      icon: Terminal,
      onClick: onToggleTerminal,
      gradient: "from-purple-500 via-pink-500 to-red-500",
      isActive: false,
      tooltip: "Terminal",
      enabled: flags.features.floatingTerminal,
    },
    {
      name: "Mobile",
      icon: Smartphone,
      onClick: onToggleMobilePreview,
      gradient: "from-pink-500 via-rose-500 to-orange-500",
      isActive: false,
      tooltip: "Mobile Apps",
      enabled: flags.features.mobilePreview,
    },
    {
      name: "Tech Stack",
      icon: Layers,
      onClick: onToggleTechVisualizer,
      gradient: "from-green-500 via-emerald-500 to-cyan-500",
      isActive: false,
      tooltip: "Tech Stack",
      enabled: flags.features.techVisualizer,
    },
    {
      name: "Chatbot",
      icon: MessageSquare,
      onClick: onToggleChatbot,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      isActive: false,
      tooltip: "AI Assistant",
      enabled: flags.features.chatbot,
    },
    {
      name: "Music",
      icon: Music,
      onClick: onToggleMusic,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      isActive: false,
      tooltip: "Music Player",
      enabled: flags.features.musicPlayer,
    },
    {
      name: "Theme",
      icon: Palette,
      onClick: onToggleTheme,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      isActive: false,
      tooltip: "Customize Theme",
      enabled: flags.features.themeCustomizer,
    },
  ].filter((app) => app.enabled);

  if (onToggleSettings) {
    apps.push({
      name: "Settings",
      icon: Settings2,
      onClick: onToggleSettings,
      gradient: "from-purple-500 via-violet-500 to-purple-600",
      isActive: false,
      tooltip: "Feature Settings",
      enabled: true, // Settings is always enabled
    });
  }

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1 : 0.5,
          x: isHovered ? 0 : 20,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative pr-4"
      >
        {/* Colorful glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-3xl" />

        {/* App bar container */}
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-3xl p-3 shadow-2xl overflow-visible">
          <div className="flex flex-col gap-2">
            {apps.map((app, index) => {
              const Icon = app.icon;
              return (
                <motion.div
                  key={app.name}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="relative group"
                >
                  {/* Tooltip - only show when hovered */}
                  {isHovered && (
                    <div className="absolute right-full mr-8 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]">
                      <p className="text-xs font-medium text-white">{app.tooltip}</p>
                    </div>
                  )}

                  {/* App icon button */}
                  <motion.button
                    whileHover={
                      isHovered
                        ? {
                            scale: 1.4,
                            rotate: 5,
                            x: -10,
                            boxShadow:
                              "0 20px 40px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)",
                            zIndex: 50,
                          }
                        : {}
                    }
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => trackAction("hover", "appbar-item", { label: app.name })}
                    onClick={() => {
                      trackAction("click", "appbar-item", { label: app.name });
                      app.onClick();
                    }}
                    className={`relative w-10 h-10 rounded-xl transition-all overflow-hidden cursor-pointer ${
                      app.isActive ? "ring-2 ring-white/50 shadow-lg" : ""
                    }`}
                  >
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${app.gradient} ${
                        app.isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                      } transition-opacity`}
                    />

                    {/* Icon */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>

                    {/* Active pulse effect */}
                    {app.isActive && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl`}
                      />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
      </motion.div>
    </motion.div>
  );
}

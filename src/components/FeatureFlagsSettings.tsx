"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, RotateCcw, Check } from "lucide-react";
import { useFeatureFlags, useFeatureFlagsActions } from "@/context/FeatureFlagsContext";
import { useToast } from "@/context/ToastContext";

interface FeatureFlagsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeatureFlagsSettings({ isOpen, onClose }: FeatureFlagsSettingsProps) {
  const flags = useFeatureFlags();
  const { toggleFeature, toggleSection, resetToDefaults } = useFeatureFlagsActions();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<"sections" | "features">("sections");

  const handleReset = () => {
    resetToDefaults();
    showSuccess("Settings reset to defaults");
  };

  const sectionLabels: Record<string, string> = {
    hero: "Hero / Landing Page",
    about: "About Me",
    skills: "Skills Showcase",
    projects: "Projects Portfolio",
    experience: "Experience Timeline",
    testimonials: "Testimonials",
    contact: "Contact Section",
  };

  const featureLabels: Record<string, { label: string; description: string }> = {
    floatingTerminal: { label: "Terminal", description: "Interactive terminal window" },
    chatbot: { label: "AI Chatbot", description: "AI assistant chatbot" },
    commandPalette: { label: "Command Palette", description: "Keyboard shortcuts (⌘K)" },
    searchModal: { label: "Search", description: "Global search functionality" },
    musicPlayer: { label: "Music Player", description: "Background music player" },
    themeCustomizer: { label: "Theme Customizer", description: "Color & theme settings" },
    achievementSystem: { label: "Achievements", description: "Easter egg achievements" },
    konamiCode: { label: "Konami Code", description: "Secret easter egg (↑↑↓↓←→←→BA)" },
    particleCursor: { label: "Particle Cursor", description: "Animated cursor effects" },
    clickCounter: { label: "Click Counter", description: "Click tracking easter egg" },
    toastNotifications: { label: "Notifications", description: "Toast notifications" },
    interactiveBackground: { label: "3D Background", description: "Particle background animation" },
    githubHeatmap: { label: "GitHub Heatmap", description: "Contribution heatmap" },
    techVisualizer: { label: "Tech Visualizer", description: "Technology stack modal" },
    skillRadar: { label: "Skills Radar", description: "Radar chart visualization" },
    mobilePreview: { label: "Mobile Preview", description: "Mobile app preview modal" },
    quickActions: { label: "Quick Actions", description: "Floating share icons & social links" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] theme-card border-2 border-[var(--accent-primary)] md:rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b theme-border bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-primary)]/20 rounded-lg">
                  <Settings2 className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold theme-text">Customize Experience</h2>
                  <p className="text-sm theme-text-secondary">Choose what you want to see</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 theme-text" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b theme-border bg-[var(--accent-primary)]/5">
              <button
                onClick={() => setActiveTab("sections")}
                className={`flex-1 px-6 py-3 font-medium transition-colors relative ${
                  activeTab === "sections"
                    ? "text-[var(--accent-primary)]"
                    : "theme-text-secondary hover:theme-text"
                }`}
              >
                Sections
                {activeTab === "sections" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`flex-1 px-6 py-3 font-medium transition-colors relative ${
                  activeTab === "features"
                    ? "text-[var(--accent-primary)]"
                    : "theme-text-secondary hover:theme-text"
                }`}
              >
                Features
                {activeTab === "features" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "sections" && (
                <div className="space-y-2">
                  <p className="text-sm theme-text-secondary mb-4">
                    Toggle page sections on or off based on your preference
                  </p>
                  {Object.entries(flags.sections)
                    .filter(([key]) => flags.userCustomizable.sections.includes(key))
                    .map(([key, value]) => (
                      <motion.label
                        key={key}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--accent-primary)]/5 cursor-pointer group transition-colors"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => toggleSection(key as keyof typeof flags.sections)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                              value
                                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                                : "border-gray-400 dark:border-gray-600"
                            }`}
                          >
                            {value && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <span className="font-medium theme-text flex-1">
                          {sectionLabels[key] || key}
                        </span>
                      </motion.label>
                    ))}
                </div>
              )}

              {activeTab === "features" && (
                <div className="space-y-2">
                  <p className="text-sm theme-text-secondary mb-4">
                    Enable or disable interactive features and enhancements
                  </p>
                  {Object.entries(flags.features)
                    .filter(([key]) => flags.userCustomizable.features.includes(key))
                    .map(([key, value]) => (
                      <motion.label
                        key={key}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--accent-primary)]/5 cursor-pointer group transition-colors"
                      >
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => toggleFeature(key as keyof typeof flags.features)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                              value
                                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                                : "border-gray-400 dark:border-gray-600"
                            }`}
                          >
                            {value && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium theme-text">
                            {featureLabels[key]?.label || key}
                          </div>
                          <div className="text-xs theme-text-secondary mt-0.5">
                            {featureLabels[key]?.description || ""}
                          </div>
                        </div>
                      </motion.label>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t theme-border bg-[var(--accent-primary)]/5">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium theme-text-secondary hover:theme-text hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[var(--accent-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Target, Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

import { usePortfolio } from "@/context/PortfolioContext";

const iconMap: Record<string, any> = {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
};

export default function AchievementSystem() {
  const portfolio = usePortfolio();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [counters, setCounters] = useState({
    terminalOpens: 0,
    themeSwitches: 0,
    sectionsVisited: new Set<string>(),
  });

  const achievements = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.achievements.map((a) => ({
      ...a,
      icon: iconMap[a.icon] || Star,
    }));
  }, [portfolio]);

  const unlockAchievement = useCallback(
    (id: string) => {
      if (unlockedAchievements.has(id)) return;

      const achievement = achievements.find((a) => a.id === id);
      if (!achievement) return;

      const newUnlocked = new Set(unlockedAchievements).add(id);
      setUnlockedAchievements(newUnlocked);
      localStorage.setItem("achievements", JSON.stringify([...newUnlocked]));

      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 4000);
    },
    [unlockedAchievements, achievements]
  );

  const saveCounters = useCallback((newCounters: typeof counters) => {
    localStorage.setItem(
      "achievementCounters",
      JSON.stringify({
        ...newCounters,
        sectionsVisited: [...newCounters.sectionsVisited],
      })
    );
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("achievements");
    if (saved) {
      setTimeout(() => setUnlockedAchievements(new Set(JSON.parse(saved))), 0);
    } else {
      // First visit achievement
      setTimeout(() => unlockAchievement("first_visit"), 0);
    }

    const savedCounters = localStorage.getItem("achievementCounters");
    if (savedCounters) {
      const parsed = JSON.parse(savedCounters);
      setTimeout(
        () =>
          setCounters({
            ...parsed,
            sectionsVisited: new Set(parsed.sectionsVisited || []),
          }),
        0
      );
    }
  }, [unlockAchievement]);

  // Export functions for tracking
  useEffect(() => {
    // @ts-expect-error -- window.trackAchievement is added by external script - Add to window for access
    window.trackAchievement = {
      terminalOpen: () => {
        const newCount = counters.terminalOpens + 1;
        setCounters((c) => ({ ...c, terminalOpens: newCount }));
        if (newCount >= 5) unlockAchievement("terminal_master");
        saveCounters({ ...counters, terminalOpens: newCount });
      },
      themeSwitch: () => {
        const newCount = counters.themeSwitches + 1;
        setCounters((c) => ({ ...c, themeSwitches: newCount }));
        if (newCount >= 3) unlockAchievement("theme_switcher");
        saveCounters({ ...counters, themeSwitches: newCount });
      },
      visitSection: (section: string) => {
        const newVisited = new Set(counters.sectionsVisited).add(section);
        setCounters((c) => ({ ...c, sectionsVisited: newVisited }));
        if (newVisited.size >= 4) unlockAchievement("explorer");
        saveCounters({ ...counters, sectionsVisited: newVisited });
      },
      konamiCode: () => unlockAchievement("konami_master"),
    };
  }, [counters, unlockedAchievements, saveCounters, unlockAchievement]);

  return (
    <AnimatePresence>
      {showAchievement && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed top-24 right-4 z-[9999] bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl border-2 border-yellow-400 min-w-[300px]"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <showAchievement.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Achievement Unlocked!
              </div>
              <h3 className="font-bold text-lg">{showAchievement.title}</h3>
              <p className="text-sm opacity-90">{showAchievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

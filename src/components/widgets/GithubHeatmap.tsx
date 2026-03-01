"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function GithubHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate last 365 days of data
  const [days, setDays] = useState<{ date: Date; count: number }[]>([]);

  useEffect(() => {
    const newDays = Array.from({ length: 365 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (364 - i));
      // Simulate "random" but realistic coding patterns (more on weekdays, some streaks)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseChance = isWeekend ? 0.3 : 0.8;
      const count = Math.random() > baseChance ? 0 : Math.floor(Math.random() * 10);
      return { date, count };
    });
    setTimeout(() => setDays(newDays), 0);
  }, []);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };

  const getColor = (level: number) => {
    // Theme-aware colors (using Tailwind classes would be better but for dynamic inline styles we might need specific values or classes)
    // We'll use classes and let Tailwind handle the colors via `data-level` attribute
    switch (level) {
      case 0:
        return "bg-black/5 dark:bg-white/5";
      case 1:
        return "bg-emerald-900/40 dark:bg-emerald-900/40";
      case 2:
        return "bg-emerald-700/60 dark:bg-emerald-700/60";
      case 3:
        return "bg-emerald-500/80 dark:bg-emerald-500/80";
      case 4:
        return "bg-emerald-400 dark:bg-emerald-400";
      default:
        return "bg-black/5 dark:bg-white/5";
    }
  };

  return (
    <div className="w-full p-6 theme-card border theme-border rounded-2xl theme-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold theme-text">Coding Activity</h3>
        <div className="flex items-center gap-2 text-xs theme-text-secondary">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
        <div className="flex gap-1 min-w-max">
          {/* Weeks columns */}
          {Array.from({ length: 53 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayData = days[weekIndex * 7 + dayIndex];
                if (!dayData) return null;

                const level = getLevel(dayData.count);

                return (
                  <motion.div
                    key={dayData.date.toISOString()}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: weekIndex * 0.01 + dayIndex * 0.01 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    onHoverStart={(e) => {
                      // @ts-expect-error -- e.target is an Element
                      const rect = e.target.getBoundingClientRect();
                      setHoveredDay({
                        date: dayData.date.toLocaleDateString(undefined, { dateStyle: "medium" }),
                        count: dayData.count,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                    }}
                    onHoverEnd={() => setHoveredDay(null)}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getColor(level)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: hoveredDay.x, top: hoveredDay.y }}
          >
            {hoveredDay.count} contributions on {hoveredDay.date}
          </div>
        )}
      </div>
    </div>
  );
}

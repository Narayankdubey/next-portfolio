"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { getSkillIcon, getSkillColor } from "@/utils/skillIcons";

export default function TechMarquee() {
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  const skills = [
    ...portfolio.skills.frontend,
    ...portfolio.skills.backend,
    ...portfolio.skills.tools,
  ];

  // Duplicate the list to ensure seamless looping
  const marqueeSkills = [...skills, ...skills, ...skills];

  return (
    <div className="w-full overflow-hidden py-10 relative">
      {/* Gradient masks for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-8 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30,
        }}
      >
        {marqueeSkills.map((skill, index) => {
          const Icon = getSkillIcon(skill);
          const color = getSkillColor(skill);

          return (
            <div
              key={`${skill}-${index}`}
              className="group relative px-6 py-3 rounded-full theme-card border theme-border theme-text font-medium whitespace-nowrap hover:border-blue-500 transition-all cursor-default"
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 rounded-full blur-md transition-opacity`}
              />

              {/* Content */}
              <div className="relative flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{skill}</span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

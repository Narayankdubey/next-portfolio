"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import GlitchText from "./GlitchText";
import { getSkillIcon, getSkillColor, getSkillBrandColor } from "@/utils/skillIcons";
import { useSectionTracking } from "@/hooks/useAnalytics";

type SkillCategory = "All" | "Frontend" | "Backend" | "Tools";

export default function Skills() {
  const portfolio = usePortfolio();
  const [activeTab, setActiveTab] = useState<SkillCategory>("All");
  const sectionRef = useSectionTracking("skills");

  if (!portfolio) return null;

  const categories: SkillCategory[] = ["All", "Frontend", "Backend", "Tools"];

  const getSkillsByCategory = (category: SkillCategory) => {
    switch (category) {
      case "Frontend":
        return portfolio.skills.frontend;
      case "Backend":
        return portfolio.skills.backend;
      case "Tools":
        return portfolio.skills.tools;
      case "All":
      default:
        return [
          ...portfolio.skills.frontend,
          ...portfolio.skills.backend,
          ...portfolio.skills.tools,
          ...(portfolio.skills.other || []),
        ];
    }
  };

  const currentSkills = getSkillsByCategory(activeTab);

  return (
    <section ref={sectionRef} id="skills" className="py-20 px-4 md:px-8 theme-card">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <GlitchText
            text="Technical Skills"
            as="h2"
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text mb-4"
          />
          <p className="theme-text-secondary max-w-2xl mx-auto">
            A comprehensive look at my technical expertise across different domains.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-2 p-1 theme-card rounded-xl backdrop-blur-sm border theme-border">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === category ? "theme-text" : "theme-text-secondary hover:theme-text"
                }`}
              >
                {activeTab === category && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentSkills.map((skill, index) => {
              const Icon = getSkillIcon(skill);
              const color = getSkillColor(skill);

              return (
                <motion.div
                  layout
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity duration-300`}
                  />
                  <div className="relative h-full p-4 theme-card border theme-border rounded-xl hover:border-blue-500 transition-all duration-300 theme-shadow flex flex-col items-center justify-center gap-3 text-center">
                    <Icon
                      className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                      style={{ color: getSkillBrandColor(skill) }}
                    />
                    <span className="text-sm font-medium theme-text group-hover:text-blue-400 transition-colors">
                      {skill}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

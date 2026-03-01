"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Code, Database, Wrench, Layers, LucideIcon } from "lucide-react";
import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import DraggableModal from "@/components/modals/DraggableModal";
import { getSkillIcon, getSkillColor } from "@/utils/skillIcons";

interface TechVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, LucideIcon> = {
  frontend: Code,
  backend: Database,
  tools: Wrench,
  other: Layers,
};

const categoryColors: Record<string, string> = {
  frontend: "from-cyan-500 to-blue-500",
  backend: "from-green-500 to-emerald-500",
  tools: "from-purple-500 to-pink-500",
  other: "from-orange-500 to-red-500",
};

export default function TechVisualizer({ isOpen, onClose }: TechVisualizerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  const categories = Object.keys(portfolio.skills);
  const displaySkills = selectedCategory
    ? { [selectedCategory]: portfolio.skills[selectedCategory as keyof typeof portfolio.skills] }
    : portfolio.skills;

  return (
    <AnimatePresence>
      {isOpen && (
        <DraggableModal
          windowId="tech-visualizer"
          isOpen={isOpen}
          onClose={onClose}
          title="Tech Stack Visualizer"
          defaultWidth={900}
          defaultHeight={700}
          minWidth={600}
          minHeight={500}
        >
          <div className="flex flex-col h-full">
            {/* Category Filter */}
            <div className="p-4 md:p-6 border-b theme-border flex-shrink-0">
              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full font-medium transition-all cursor-pointer ${
                    selectedCategory === null
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "theme-card border theme-border hover:border-blue-500 theme-text"
                  }`}
                >
                  All Skills
                </button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category] || Layers;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        selectedCategory === category
                          ? `bg-gradient-to-r ${categoryColors[category]} text-white`
                          : "theme-card border theme-border hover:border-blue-500 theme-text"
                      }`}
                    >
                      <Icon className="w-3 h-3 md:w-4 md:h-4" />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              {Object.entries(displaySkills).map(([category, skills]) => {
                const Icon = categoryIcons[category] || Layers;
                const color = categoryColors[category];

                return (
                  <div key={category} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 bg-gradient-to-r ${color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold theme-text capitalize">{category}</h3>
                      <span className="theme-text-secondary text-sm">
                        ({(skills as string[]).length} skills)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(skills as string[]).map((skill, index) => {
                        const SkillIcon = getSkillIcon(skill);
                        const skillColor = getSkillColor(skill);

                        return (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            onHoverStart={() => setHoveredSkill(skill)}
                            onHoverEnd={() => setHoveredSkill(null)}
                            className="relative group cursor-pointer"
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${skillColor} opacity-0 group-hover:opacity-30 rounded-xl blur-lg transition-opacity`}
                            />
                            <div
                              className={`relative p-4 theme-card border theme-border rounded-xl hover:border-blue-500 transition-all theme-shadow text-center ${
                                hoveredSkill === skill ? "border-blue-500" : ""
                              }`}
                            >
                              {/* Icon */}
                              <div className="flex justify-center mb-2">
                                <div className={`p-2 bg-gradient-to-r ${skillColor} rounded-lg`}>
                                  <SkillIcon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              {/* Skill Name */}
                              <p className="font-medium theme-text text-sm">{skill}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Footer */}
            <div className="p-4 md:p-6 border-t theme-border theme-card flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {Object.entries(portfolio.skills).map(([category, skills]) => (
                  <div key={category}>
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {(skills as string[]).length}
                    </p>
                    <p className="theme-text-secondary text-xs md:text-sm capitalize mt-1">
                      {category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DraggableModal>
      )}
    </AnimatePresence>
  );
}

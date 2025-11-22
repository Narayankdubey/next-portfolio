"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import TechMarquee from "./TechMarquee";
import GithubHeatmap from "./GithubHeatmap";
import GlitchText from "./GlitchText";
import { getSkillIcon, getSkillColor } from "@/utils/skillIcons";

export default function About() {
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  const allSkills = [
    ...portfolio.skills.frontend,
    ...portfolio.skills.backend,
    ...portfolio.skills.tools,
    ...(portfolio.skills.other || []),
  ];

  // Take top 8 skills for display
  const skillsWithIcons = allSkills.slice(0, 8).map((skill) => ({
    name: skill,
    icon: getSkillIcon(skill),
    color: getSkillColor(skill),
  }));

  return (
    <section id="about" className="min-h-screen flex items-center px-4 md:px-8 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <GlitchText
            text="About Me"
            as="h2"
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {portfolio.about.bio.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-xl text-gray-300 leading-relaxed"
                    : "text-lg text-gray-400 leading-relaxed"
                }
              >
                {paragraph}
              </p>
            ))}
          </motion.div>

          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-semibold mb-6 theme-text"
            >
              Skills & Tech
            </motion.h3>
            <div className="grid grid-cols-2 gap-4">
              {skillsWithIcons.map((skill, i) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity`}
                    />
                    <div className="relative p-4 theme-card border theme-border rounded-xl hover:border-blue-500 transition-all theme-shadow">
                      <Icon className="w-6 h-6 mb-2 text-blue-400" />
                      <p className="text-sm font-medium theme-text">{skill.name}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <GithubHeatmap />
        </div>

        <div className="mt-20">
          <TechMarquee />
        </div>
      </div>
    </section>
  );
}

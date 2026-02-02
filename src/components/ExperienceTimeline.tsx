"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useSound } from "@/context/SoundContext";
import { IExperience } from "@/models/Portfolio";
import { useSectionTracking } from "@/hooks/useAnalytics";

export default function ExperienceTimeline() {
  const portfolio = usePortfolio();
  const { playHover } = useSound();
  const experienceRef = useSectionTracking("experience");

  if (!portfolio) return null;

  return (
    <section id="experience" ref={experienceRef} className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Professional Journey
          </h2>
          <p className="theme-text-secondary max-w-2xl mx-auto">
            I&apos;ve been building things on the web for over 5 years. Here&apos;s a timeline of my
            professional journey.
          </p>
        </motion.div>

        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent md:-translate-x-1/2" />

          <div className="space-y-12">
            {portfolio.experience.map((exp, index) => (
              <TimelineItem key={index} exp={exp} index={index} playHover={playHover} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  exp,
  index,
  playHover,
}: {
  exp: IExperience;
  index: number;
  playHover: () => void;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className={`relative flex flex-col md:flex-row gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}
      onMouseEnter={playHover}
    >
      {/* Timeline Node */}
      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] md:-translate-x-1/2 mt-6 z-10 ring-4 ring-black dark:ring-black" />

      {/* Content Card */}
      <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? "md:pl-12" : "md:pr-12"}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="theme-card p-6 rounded-2xl border theme-border shadow-lg relative group overflow-hidden"
        >
          {/* Hover Glow Effect */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${exp.color || "from-blue-500 to-purple-500"}`}
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-xl font-bold theme-text flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
                {exp.role}
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {exp.type}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm theme-text-secondary">
              <span className="font-semibold text-[var(--accent-secondary)]">{exp.company}</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {exp.period}
              </div>
            </div>

            <ul className="space-y-2">
              {exp.description.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm theme-text-secondary">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Empty space for the other side */}
      <div className="hidden md:block md:w-1/2" />
    </motion.div>
  );
}

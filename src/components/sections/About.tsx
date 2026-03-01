"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import TechMarquee from "@/components/effects/TechMarquee";
import GithubHeatmap from "@/components/widgets/GithubHeatmap";
import GlitchText from "@/components/effects/GlitchText";
import { useSectionTracking } from "@/hooks/useAnalytics";

export default function About() {
  const portfolio = usePortfolio();
  const flags = useFeatureFlags();
  const sectionRef = useSectionTracking("about");

  if (!portfolio) return null;

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen flex items-center px-4 md:px-8 py-20"
    >
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <GlitchText
            text="About Me"
            as="h2"
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-center md:text-left"
        >
          {portfolio.about.bio.map((paragraph, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-xl theme-text leading-relaxed"
                  : "text-lg theme-text-secondary leading-relaxed"
              }
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {flags.features.githubHeatmap && (
          <div className="mt-16">
            <GithubHeatmap />
          </div>
        )}

        {flags.features.techMarquee && (
          <div className="mt-20">
            <TechMarquee />
          </div>
        )}
      </div>
    </section>
  );
}

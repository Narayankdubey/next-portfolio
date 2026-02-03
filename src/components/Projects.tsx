import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import { usePortfolio } from "@/context/PortfolioContext";
import TiltCard from "./TiltCard";
import { getSkillIcon } from "@/utils/skillIcons";
import { IProject } from "@/models/Portfolio";
import { useAnalytics } from "@/context/AnalyticsContext";

function ProjectCard({ project }: { project: IProject }) {
  const { trackAction } = useAnalytics();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <div className="group relative theme-card border theme-border rounded-2xl p-6 hover:border-blue-500/50 transition-all theme-shadow h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex-1 flex flex-col">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {project.title}
            </h3>
            <p className="theme-text-secondary mb-4 line-clamp-3 flex-1">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => {
                const Icon = getSkillIcon(tag);
                return (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                );
              })}
            </div>

            <div className="flex gap-4 mt-auto">
              <motion.a
                href={project.github}
                whileHover={{ scale: 1.1 }}
                onClick={() => trackAction("click", "project-github", { title: project.title })}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 theme-card border theme-border rounded-lg hover:border-blue-500 transition-colors theme-text"
              >
                <Github className="w-4 h-4" />
                Code
              </motion.a>
              {project.demo !== "#" && (
                <motion.a
                  href={project.demo}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => trackAction("click", "project-demo", { title: project.title })}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Demo
                </motion.a>
              )}
              {(project as any).playStoreUrl && (project as any).playStoreUrl !== "#" && (
                <motion.a
                  href={(project as any).playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    trackAction("click", "project-playstore", { title: project.title })
                  }
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors border border-gray-600 shadow-lg hover:shadow-xl"
                  title="Get it on Google Play"
                >
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                </motion.a>
              )}
              {(project as any).appStoreUrl && (project as any).appStoreUrl !== "#" && (
                <motion.a
                  href={(project as any).appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => trackAction("click", "project-appstore", { title: project.title })}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors border border-gray-600 shadow-lg hover:shadow-xl"
                  title="Download on the App Store"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Projects() {
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  return (
    <section id="projects" className="min-h-screen flex items-center px-4 md:px-8 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            Projects
          </motion.h2>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {/* Filter buttons removed as filtering logic is no longer present */}
          </motion.div>
        </div>

        <motion.div layout className="grid md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {portfolio.projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

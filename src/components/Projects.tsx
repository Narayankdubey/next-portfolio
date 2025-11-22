import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import TiltCard from "./TiltCard";
import { getSkillIcon } from "@/utils/skillIcons";
import { IProject } from "@/models/Portfolio";

function ProjectCard({ project }: { project: IProject }) {
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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Demo
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

"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Experience() {
  const portfolio = usePortfolio();

  if (!portfolio) return null;

  const experiences = portfolio.experience;

  return (
    <section id="experience" className="min-h-screen flex items-center px-4 md:px-8 py-20">
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-16 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
        >
          Experience
        </motion.h2>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30 hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-0 md:pl-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className={`absolute left-6 top-6 w-5 h-5 rounded-full bg-gradient-to-r ${exp.color} hidden md:block border-4 border-gray-900`}
                />

                <motion.div whileHover={{ scale: 1.02, x: 10 }} className="group relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${exp.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`}
                  />
                  <div className="relative p-8 theme-card border theme-border rounded-2xl hover:border-blue-500/50 transition-all theme-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                      <div>
                        <h3
                          className={`text-2xl font-bold bg-gradient-to-r ${exp.color} bg-clip-text text-transparent`}
                        >
                          {exp.company}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 theme-text-secondary">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <p className="text-lg">{exp.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 theme-text-secondary px-4 py-2 theme-card rounded-full border theme-border">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{exp.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {exp.description.map((item, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 + j * 0.05 }}
                          className="theme-text-secondary flex items-start gap-3"
                        >
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${exp.color} flex-shrink-0`}
                          />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

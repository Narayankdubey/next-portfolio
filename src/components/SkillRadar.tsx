"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

interface SkillCategory {
  name: string;
  level: number; // 0-100
}

// Assuming 'data' is defined elsewhere or passed as a prop,
// and 'data.skills' is an object where keys are skill names
// and values are objects containing a 'level' property.
// For example:
// const data = {
//   skills: {
//     Frontend: { level: 90 },
//     Backend: { level: 85 },
//     Mobile: { level: 75 },
//     Database: { level: 80 },
//     DevOps: { level: 70 },
//     Design: { level: 65 },
//   }
// };

export default function SkillRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Group skills by category
  const skillCategories: SkillCategory[] = useMemo(
    () => [
      { name: "Frontend", level: 90 },
      { name: "Backend", level: 85 },
      { name: "Mobile", level: 75 },
      { name: "Database", level: 80 },
      { name: "DevOps", level: 70 },
      { name: "Design", level: 65 },
    ],
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circles
    const levels = 5;
    for (let i = levels; i > 0; i--) {
      const radius = (maxRadius / levels) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + (i / levels) * 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes and labels
    const angleStep = (Math.PI * 2) / skillCategories.length;
    skillCategories.forEach((skill, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * maxRadius;
      const y = centerY + Math.sin(angle) * maxRadius;

      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label
      const labelX = centerX + Math.cos(angle) * (maxRadius + 20);
      const labelY = centerY + Math.sin(angle) * (maxRadius + 20);
      ctx.fillStyle = hoveredSkill === skill.name ? "#10b981" : "#6b7280";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(skill.name, labelX, labelY);
    });

    // Draw skill polygon
    ctx.beginPath();
    skillCategories.forEach((skill, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const radius = (skill.level / 100) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    // Fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
    gradient.addColorStop(1, "rgba(6, 182, 212, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    skillCategories.forEach((skill, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const radius = (skill.level / 100) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, hoveredSkill === skill.name ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = hoveredSkill === skill.name ? "#10b981" : "#06b6d4";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [hoveredSkill, skillCategories]);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative"
      >
        <canvas ref={canvasRef} width={500} height={500} className="max-w-full h-auto" />
      </motion.div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {skillCategories.map((skill) => (
          <button
            key={skill.name}
            onMouseEnter={() => setHoveredSkill(skill.name)}
            onMouseLeave={() => setHoveredSkill(null)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${
                hoveredSkill === skill.name
                  ? "bg-emerald-500/20 border-2 border-emerald-500"
                  : "theme-card border-2 border-transparent"
              }
            `}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="theme-text text-sm font-medium">{skill.name}</span>
            <span className="ml-auto text-emerald-500 font-bold text-sm">{skill.level}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

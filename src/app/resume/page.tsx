"use client";

import { useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function Resume() {
  const portfolio = usePortfolio();

  useEffect(() => {
    if (portfolio) {
      // Auto-trigger print dialog
      window.print();
    }
  }, [portfolio]);

  if (!portfolio) return <div className="p-10 text-center">Loading resume...</div>;

  return (
    <div className="bg-white text-black p-10 max-w-4xl mx-auto print:p-8">
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold text-black mb-2">{portfolio.personal.name}</h1>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            Email: <span className="text-black">{portfolio.personal.email}</span> | Phone:{" "}
            {portfolio.personal.phone} | Location: {portfolio.personal.location}
          </p>
          <p>
            Website: <span className="text-black">{portfolio.personal.website}</span> | GitHub:{" "}
            <span className="text-black">github.com/narayandubey</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-sm leading-relaxed text-justify">{portfolio.personal.tagline}</p>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1 mb-3">
          TECHNICAL SKILLS
        </h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-black">Frontend: </span>
            {portfolio.skills.frontend.join(", ")}
          </div>
          <div>
            <span className="font-semibold text-black">Backend: </span>
            {portfolio.skills.backend.join(", ")}
          </div>
          <div>
            <span className="font-semibold text-black">Tools & Technologies: </span>
            {portfolio.skills.tools.join(", ")}, {portfolio.skills.other.join(", ")}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1 mb-3">
          PROFESSIONAL EXPERIENCE
        </h2>
        {portfolio.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <h3 className="font-bold text-black">{exp.company}</h3>
                <p className="text-sm text-gray-700">
                  {exp.role} | {exp.type}
                </p>
              </div>
              <span className="text-sm italic text-gray-700">{exp.period}</span>
            </div>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {exp.description.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1 mb-3">
          KEY PROJECTS
        </h2>
        {portfolio.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-black">{project.title}</h3>
              <span className="text-xs italic text-gray-700">{project.tags.join(", ")}</span>
            </div>
            <p className="text-sm ml-5">{project.description}</p>
            {project.demo !== "#" && <p className="text-sm ml-5 text-black">{project.demo}</p>}
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1 mb-3">
          EDUCATION
        </h2>
        {portfolio.education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="font-bold text-black">{edu.degree}</h3>
                <p className="text-sm text-gray-700">
                  {edu.institution}, {edu.location}
                </p>
              </div>
              <span className="text-sm italic text-gray-700">
                {edu.period} {edu.gpa && `| GPA: ${edu.gpa}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold text-black border-b-2 border-black pb-1 mb-3">
          ACHIEVEMENTS
        </h2>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {portfolio.awards.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

export function useResume() {
  const [isGenerating, setIsGenerating] = useState(false);
  const portfolio = usePortfolio();

  const generateResumeHTML = (portfolio: any) => {
    if (!portfolio) return "";
    return `
      <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
          <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">${portfolio.personal.name.toUpperCase()}</h1>
          <p style="font-size: 12px; margin: 5px 0;">
            Email: ${portfolio.personal.email} | Phone: ${portfolio.personal.phone} | Location: ${portfolio.personal.location}
          </p>
          <p style="font-size: 12px; margin: 5px 0;">
            Website: ${portfolio.personal.website} | GitHub: github.com/narayandubey
          </p>
        </div>

        <!-- Summary -->
        <p style="font-size: 12px; margin-bottom: 15px; text-align: justify;">${portfolio.personal.tagline}</p>

        <!-- Skills -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">TECHNICAL SKILLS</h2>
        <p style="font-size: 11px; margin: 5px 0;"><strong>Frontend:</strong> ${portfolio.skills.frontend.join(", ")}</p>
        <p style="font-size: 11px; margin: 5px 0;"><strong>Backend:</strong> ${portfolio.skills.backend.join(", ")}</p>
        <p style="font-size: 11px; margin: 5px 0;"><strong>Tools:</strong> ${portfolio.skills.tools.join(", ")}</p>

        <!-- Experience -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">PROFESSIONAL EXPERIENCE</h2>
        ${portfolio.experience
          .map(
            (exp: any) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>
                <h3 style="font-size: 13px; font-weight: bold; margin: 0;">${exp.company}</h3>
                <p style="font-size: 11px; margin: 2px 0; color: #333;">${exp.role} | ${exp.type}</p>
              </div>
              <span style="font-size: 11px; font-style: italic; color: #333;">${exp.period}</span>
            </div>
            <ul style="margin: 5px 0 0 20px; font-size: 11px;">
              ${exp.description.map((item: string) => `<li style="margin: 3px 0;">${item}</li>`).join("")}
            </ul>
          </div>
        `
          )
          .join("")}

        <!-- Projects -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">KEY PROJECTS</h2>
        ${portfolio.projects
          .map(
            (project: any) => `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0;">${project.title}</h3>
              <span style="font-size: 10px; font-style: italic; color: #333;">${project.tags.join(", ")}</span>
            </div>
            <p style="font-size: 11px; margin: 3px 0 0 20px;">${project.description}</p>
          </div>
        `
          )
          .join("")}

        <!-- Education -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">EDUCATION</h2>
        ${portfolio.education
          .map(
            (edu: any) => `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <h3 style="font-size: 12px; font-weight: bold; margin: 0;">${edu.degree}</h3>
                <p style="font-size: 11px; margin: 2px 0; color: #333;">${edu.institution}, ${edu.location}</p>
              </div>
              <span style="font-size: 11px; font-style: italic; color: #333;">${edu.period}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</span>
            </div>
          </div>
        `
          )
          .join("")}

        <!-- Achievements -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">ACHIEVEMENTS</h2>
        <ul style="margin: 5px 0 0 20px; font-size: 11px;">
          ${portfolio.awards.map((achievement: string) => `<li style="margin: 3px 0;">${achievement}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  const handleDownload = async () => {
    if (!portfolio) return;
    setIsGenerating(true);
    try {
      // Dynamically import libraries
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Create a temporary div with resume content
      const resumeDiv = document.createElement("div");
      resumeDiv.style.position = "absolute";
      resumeDiv.style.left = "-9999px";
      resumeDiv.style.width = "210mm"; // A4 width
      resumeDiv.style.backgroundColor = "white";
      resumeDiv.style.padding = "20px";

      // Generate resume HTML
      resumeDiv.innerHTML = generateResumeHTML(portfolio);
      document.body.appendChild(resumeDiv);

      // Convert to canvas
      const canvas = await html2canvas(resumeDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${portfolio.personal.name.replace(/\s+/g, "_")}_Resume.pdf`);

      // Cleanup
      document.body.removeChild(resumeDiv);
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Fallback to print dialog
      window.open("/resume", "_blank");
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleDownload, isGenerating };
}

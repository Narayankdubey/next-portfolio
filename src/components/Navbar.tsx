"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, Menu, X, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";

const allNavItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Blog", href: "/blog", requiresFlag: "blog" as const },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { playHover, playClick } = useSound();
  const [isGenerating, setIsGenerating] = useState(false);
  const portfolio = usePortfolio();
  const pathname = usePathname();
  const router = useRouter();
  const flags = useFeatureFlags();

  // Filter nav items based on feature flags
  const navItems = allNavItems.filter(
    (item) => !item.requiresFlag || flags.features[item.requiresFlag]
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isOnBlogPage = pathname?.startsWith("/blog");
    const isAnchorLink = href.startsWith("#");

    if (isOnBlogPage && isAnchorLink) {
      e.preventDefault();
      router.push(`/${href}`);
      setIsOpen(false);
    } else if (isAnchorLink) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      resumeDiv.innerHTML = generateResumeHTML();
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

  const generateResumeHTML = () => {
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
            (exp) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>
                <h3 style="font-size: 13px; font-weight: bold; margin: 0;">${exp.company}</h3>
                <p style="font-size: 11px; margin: 2px 0; color: #333;">${exp.role} | ${exp.type}</p>
              </div>
              <span style="font-size: 11px; font-style: italic; color: #333;">${exp.period}</span>
            </div>
            <ul style="margin: 5px 0 0 20px; font-size: 11px;">
              ${exp.description.map((item) => `<li style="margin: 3px 0;">${item}</li>`).join("")}
            </ul>
          </div>
        `
          )
          .join("")}

        <!-- Projects -->
        <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin: 15px 0 10px 0;">KEY PROJECTS</h2>
        ${portfolio.projects
          .map(
            (project) => `
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
            (edu) => `
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
          ${portfolio.awards.map((achievement) => `<li style="margin: 3px 0;">${achievement}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "theme-navbar backdrop-blur-xl theme-border border-b" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8" data-tour="nav">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#home"
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            {portfolio?.personal.name}
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="theme-text-secondary hover:opacity-80 transition-opacity cursor-pointer"
                    onMouseEnter={playHover}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            {toggleTheme && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toggleTheme();
                  playClick();
                }}
                className="p-2 rounded-full theme-card hover:opacity-80 transition-opacity cursor-pointer"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                onMouseEnter={playHover}
                data-tour="theme-toggle"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium disabled:opacity-50 text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Resume"}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-300">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            <div className="flex gap-3">
              {toggleTheme && (
                <button
                  onClick={() => {
                    toggleTheme();
                    playClick();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 p-2 rounded-full bg-gray-800 text-white hover:opacity-80 transition-opacity"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="text-sm">{theme === "light" ? "Dark" : "Light"}</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  handleDownload();
                  setIsOpen(false);
                }}
                disabled={isGenerating}
                className="flex-1 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium justify-center disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Resume"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}


"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Download, Menu, X, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";
import { useResume } from "@/hooks/useResume";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";

const allNavItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Blog", href: "/blog", requiresFlag: "blog" as const },
  { name: "Chat", href: "/chat" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { playHover, playClick } = useSound();
  const { handleDownload, isGenerating } = useResume();
  const portfolio = usePortfolio();
  const pathname = usePathname();
  const flags = useFeatureFlags();

  // Filter nav items based on feature flags
  const navItems = allNavItems.filter(
    (item) => !item.requiresFlag || flags.features[item.requiresFlag]
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHomePage = pathname === "/";
    const isAnchorLink = href.startsWith("#");

    if (!isHomePage && isAnchorLink) {
      // If not on home page and clicking anchor, let Link handle the navigation to /#section
      setIsOpen(false);
      return;
    }

    if (isHomePage && isAnchorLink) {
      // If on home page and clicking anchor, prevent default to allow smooth scroll if needed
      // or just let it be. But if we use Link with scroll={true} (default), it might be fine.
      // However, usually for smooth scroll on same page we might want to handle it manually or let CSS handle it.
      // For now, we'll just close the menu.
      setIsOpen(false);
    }

    // For normal links (like /blog, /chat), just close menu
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <Link
            href="/#home"
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              {portfolio?.personal.name}
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={
                      item.href.startsWith("#") && pathname !== "/" ? `/${item.href}` : item.href
                    }
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="theme-text-secondary hover:opacity-80 transition-opacity cursor-pointer"
                    onMouseEnter={playHover}
                  >
                    {item.name}
                  </Link>
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
              <Link
                key={item.name}
                href={item.href.startsWith("#") && pathname !== "/" ? `/${item.href}` : item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
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

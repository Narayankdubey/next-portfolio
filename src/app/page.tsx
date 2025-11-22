"use client";

import { useState, useEffect, useRef } from "react";
import InteractiveBackground from "@/components/InteractiveBackground";
import Navbar from "@/components/Navbar";
import Landing from "@/components/Landing";
import About from "@/components/About";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import FloatingTerminal from "@/components/FloatingTerminal";
import SearchModal from "@/components/SearchModal";
import MobilePreview from "@/components/MobilePreview";
import TechVisualizer from "@/components/TechVisualizer";
import AppBar from "@/components/AppBar";
import ScrollProgress from "@/components/ScrollProgress";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import CommandPalette from "@/components/CommandPalette";
import ParticleCursor from "@/components/ParticleCursor";
import QuickActions from "@/components/QuickActions";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import Chatbot from "@/components/Chatbot";
import KonamiCode from "@/components/KonamiCode";
import AchievementSystem from "@/components/AchievementSystem";
import ClickCounter from "@/components/ClickCounter";
import MusicPlayer from "@/components/MusicPlayer";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import VisitorCounter from "@/components/VisitorCounter";
import MobileWarning from "@/components/MobileWarning";
import BlogWidget from "@/components/BlogWidget";
import OnboardingTour from "@/components/OnboardingTour";
import { Github, Linkedin, Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import FeatureFlagsDebugger from "@/components/FeatureFlagsDebugger";
import FeatureFlagsSettings from "@/components/FeatureFlagsSettings";
// Removed static import; data will be fetched from API

import { usePortfolio } from "@/context/PortfolioContext";

export default function Home() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalState, setTerminalState] = useState<"normal" | "minimized" | "maximized">(
    "normal"
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [techVisualizerOpen, setTechVisualizerOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [featureFlagsSettingsOpen, setFeatureFlagsSettingsOpen] = useState(false);
  const { showSuccess } = useToast();
  const { toggleTheme } = useTheme();
  const flags = useFeatureFlags();
  const portfolio = usePortfolio();

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track visitor analytics
  useEffect(() => {
    const trackVisit = async () => {
      const userId = localStorage.getItem("chatUserId");
      if (!userId) return;

      // Check if we've already tracked this session
      const sessionKey = `visit_tracked_${userId}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log("⏭️ Visit already tracked in this session");
        return;
      }

      try {
        // Mark as tracked BEFORE making the request to prevent race conditions
        sessionStorage.setItem(sessionKey, "true");

        // Import visitor detection utilities dynamically
        const { getVisitorDetailsWithLocation } = await import("@/lib/visitorDetection");
        const visitorDetails = await getVisitorDetailsWithLocation();

        console.log("📊 Sending visitor details:", visitorDetails);

        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...visitorDetails,
          }),
        });

        console.log("✅ Visit tracked successfully");
      } catch (error) {
        console.error("Failed to track visit:", error);
        // Remove the flag on error so it can retry
        sessionStorage.removeItem(sessionKey);
      }
    };

    trackVisit();
  }, []);

  // Open terminal only on desktop
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      setTerminalOpen(true);
    }
  }, []);

  // Track achievements
  useEffect(() => {
    if (terminalOpen) {
      // @ts-expect-error -- window.trackAchievement is added by external script
      window.trackAchievement?.terminalOpen();
    }
  }, [terminalOpen]);

  const handleTerminalClick = () => {
    if (!terminalOpen) {
      setTerminalOpen(true);
      showSuccess("Terminal opened");
    } else if (terminalState === "minimized") {
      setTerminalOpen(true);
      setTerminalState("normal");
      showSuccess("Terminal restored");
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    // @ts-expect-error -- window.trackAchievement is added by external script
    window.trackAchievement?.themeSwitch();
    showSuccess("Theme switched");
  };

  const handleKonamiActivate = () => {
    // @ts-expect-error -- window.trackAchievement is added by external script
    window.trackAchievement?.konamiCode();
  };

  return (
    <main className="relative min-h-screen theme-text">
      {/* Feature Flags Debugger (only shows in dev mode) */}
      <FeatureFlagsDebugger />

      {/* Onboarding Tour */}
      <OnboardingTour onOpenChatbot={() => setChatbotOpen(true)} />

      {/* Enhancement Components */}
      <ScrollProgress />
      {flags.features.particleCursor && <ParticleCursor />}
      <KeyboardShortcuts />
      {flags.features.commandPalette && (
        <CommandPalette
          onOpenTerminal={() => {
            setTerminalOpen(true);
            showSuccess("Terminal opened");
          }}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobile={() => setMobilePreviewOpen(true)}
          onOpenTechStack={() => setTechVisualizerOpen(true)}
          onToggleTheme={handleThemeToggle}
        />
      )}
      {flags.features.konamiCode && <KonamiCode onActivate={handleKonamiActivate} />}
      {flags.features.achievementSystem && <AchievementSystem />}
      {flags.features.clickCounter && <ClickCounter />}
      {flags.features.quickActions && <QuickActions />}
      {flags.features.themeCustomizer && (
        <ThemeCustomizer
          isOpen={themeCustomizerOpen}
          onClose={() => setThemeCustomizerOpen(false)}
        />
      )}
      {flags.features.chatbot && (
        <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      )}
      {flags.features.interactiveBackground && <InteractiveBackground />}
      <MobileWarning />
      <Navbar />
      <div className="relative z-10">
        {flags.sections.hero && (
          <div id="home">
            <Landing
              terminalOpen={terminalOpen}
              terminalState={terminalState}
              onTerminalClick={handleTerminalClick}
            />
          </div>
        )}
        {flags.sections.about && <About />}
        {flags.sections.experience && <ExperienceTimeline />}
        {flags.sections.projects && <Projects />}
        {flags.sections.testimonials && <TestimonialCarousel />}
        {flags.features.blog && <BlogWidget />}
        {flags.sections.contact && <Contact />}
        {flags.features.musicPlayer && (
          <MusicPlayer isOpen={musicPlayerOpen} onClose={() => setMusicPlayerOpen(false)} />
        )}
        <footer className="py-8 text-center theme-text-secondary border-t theme-border">
          <div className="flex flex-col items-center justify-center gap-6">
            <p>
              © {new Date().getFullYear()} {portfolio?.personal?.name || "Your Name"}. Crafted with
              passion.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={portfolio?.social?.github || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={portfolio?.social?.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${portfolio?.social?.email || ""}`}
                className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            <VisitorCounter />
          </div>
        </footer>
      </div>

      {/* Floating Terminal */}
      {flags.features.floatingTerminal && (
        <FloatingTerminal
          isOpen={terminalOpen}
          onClose={() => {
            setTerminalOpen(false);
            showSuccess("Terminal closed");
          }}
          onStateChange={setTerminalState}
          terminalState={terminalState}
        />
      )}

      {/* Search Modal */}
      {flags.features.searchModal && (
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      )}

      {/* Mobile Preview */}
      {flags.features.mobilePreview && (
        <MobilePreview isOpen={mobilePreviewOpen} onClose={() => setMobilePreviewOpen(false)} />
      )}

      {/* Tech Stack Visualizer */}
      {flags.features.techVisualizer && (
        <TechVisualizer isOpen={techVisualizerOpen} onClose={() => setTechVisualizerOpen(false)} />
      )}

      {/* App Bar */}
      <AppBar
        onToggleTerminal={() => {
          setTerminalOpen(!terminalOpen);
          showSuccess(terminalOpen ? "Terminal closed" : "Terminal opened");
        }}
        onToggleSearch={() => setSearchOpen(true)}
        onToggleMobilePreview={() => setMobilePreviewOpen(true)}
        onToggleTechVisualizer={() => setTechVisualizerOpen(true)}
        onToggleChatbot={() => setChatbotOpen(!chatbotOpen)}
        onToggleMusic={() => setMusicPlayerOpen(!musicPlayerOpen)}
        onToggleTheme={() => setThemeCustomizerOpen(!themeCustomizerOpen)}
        onToggleSettings={() => setFeatureFlagsSettingsOpen(true)}
      />

      {/* Feature Flags Settings */}
      <FeatureFlagsSettings
        isOpen={featureFlagsSettingsOpen}
        onClose={() => setFeatureFlagsSettingsOpen(false)}
      />
    </main>
  );
}

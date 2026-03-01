"use client";

import { useState, useEffect } from "react";
import InteractiveBackground from "@/components/effects/InteractiveBackground";
import Navbar from "@/components/layout/Navbar";
import Landing from "@/components/sections/Landing";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import ExperienceTimeline from "@/components/widgets/ExperienceTimeline";
import Projects from "@/components/sections/Projects";
import CertificatesSection from "@/components/sections/CertificatesSection";
import Contact from "@/components/sections/Contact";
import FloatingTerminal from "@/components/features/terminal/FloatingTerminal";
import SearchModal from "@/components/modals/SearchModal";
import MobilePreview from "@/components/widgets/MobilePreview";
import TechVisualizer from "@/components/effects/TechVisualizer";
import AppBar from "@/components/layout/AppBar";
import ScrollProgress from "@/components/ui/ScrollProgress";
import KeyboardShortcuts from "@/components/widgets/KeyboardShortcuts";
import CommandPalette from "@/components/widgets/CommandPalette";
import ParticleCursor from "@/components/effects/ParticleCursor";
import QuickActions from "@/components/widgets/QuickActions";
import ThemeCustomizer from "@/components/features/settings/ThemeCustomizer";
import Chatbot from "@/components/features/chat/Chatbot";
import KonamiCode from "@/components/effects/KonamiCode";
import AchievementSystem from "@/components/effects/AchievementSystem";
import ClickCounter from "@/components/ui/ClickCounter";
import MusicPlayer from "@/components/widgets/MusicPlayer";
import TestimonialCarousel from "@/components/widgets/TestimonialCarousel";
import VisitorCounter from "@/components/widgets/VisitorCounter";
import MobileWarning from "@/components/layout/MobileWarning";
import BlogWidget from "@/components/features/blog/BlogWidget";
import { Github, Linkedin, Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import FeatureFlagsDebugger from "@/components/features/settings/FeatureFlagsDebugger";
import FeatureFlagsSettings from "@/components/features/settings/FeatureFlagsSettings";
// Removed static import; data will be fetched from API

import { usePortfolio } from "@/context/PortfolioContext";
import { useAnalytics } from "@/context/AnalyticsContext";

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
  const { trackAction } = useAnalytics();

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
  // Open terminal only on desktop - DISABLED as per user request
  /* useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      setTerminalOpen(true);
    }
  }, []); */

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

  const handleTriggerGame = () => {
    showSuccess("Arcade Mode Unlocked! 🎮");
    // Trigger achievement
    // @ts-expect-error -- window.trackAchievement is added by external script
    window.trackAchievement?.unlock("konami_code");
  };

  const handleTriggerSurprise = () => {
    showSuccess("✨ A Magical Surprise! ✨");
    toggleTheme();
    // In future: Confetti
  };

  return (
    <main className="relative min-h-screen theme-text">
      {/* Feature Flags Debugger (only shows in dev mode) */}
      <FeatureFlagsDebugger />

      {/* Onboarding Tour */}
      {/* <OnboardingTour onOpenChatbot={() => setChatbotOpen(true)} /> */}

      {/* Welcome Modal */}
      {/* <WelcomeModal /> */}

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
              onToggleSearch={() => setSearchOpen(true)}
              onToggleMobilePreview={() => setMobilePreviewOpen(true)}
              onToggleTechVisualizer={() => setTechVisualizerOpen(true)}
              onToggleChatbot={() => setChatbotOpen(!chatbotOpen)}
              onToggleMusic={() => setMusicPlayerOpen(!musicPlayerOpen)}
              onToggleTheme={handleThemeToggle}
              onTriggerGame={handleTriggerGame}
              onTriggerSurprise={handleTriggerSurprise}
              onToggleSettings={() => setFeatureFlagsSettingsOpen(true)}
            />
          </div>
        )}
        {flags.sections.about && <About />}
        {flags.sections.skills && <Skills />}
        {flags.sections.experience && <ExperienceTimeline />}
        {flags.sections.projects && <Projects />}
        {flags.sections.certificates && <CertificatesSection />}
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
                onClick={() => trackAction("click", "footer-social", { platform: "github" })}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={portfolio?.social?.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAction("click", "footer-social", { platform: "linkedin" })}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${portfolio?.social?.email || ""}`}
                onClick={() => trackAction("click", "footer-social", { platform: "email" })}
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

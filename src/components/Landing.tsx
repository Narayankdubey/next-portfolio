"use client";

import Hero from "./Hero";
import { useSectionTracking } from "@/hooks/useAnalytics";

interface LandingProps {
  terminalOpen: boolean;
  terminalState: "normal" | "minimized" | "maximized";
  onTerminalClick: () => void;
  onToggleSearch: () => void;
  onToggleMobilePreview: () => void;
  onToggleTechVisualizer: () => void;
  onToggleChatbot: () => void;
  onToggleMusic: () => void;
  onToggleTheme: () => void;
  onTriggerGame: () => void;
  onTriggerSurprise: () => void;
  onToggleSettings?: () => void;
}

export default function Landing({
  terminalOpen,
  terminalState,
  onTerminalClick,
  onToggleSearch,
  onToggleMobilePreview,
  onToggleTechVisualizer,
  onToggleChatbot,
  onToggleMusic,
  onToggleTheme,
  onTriggerGame,
  onTriggerSurprise,
  onToggleSettings,
}: LandingProps) {
  const sectionRef = useSectionTracking("hero");

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center md:px-8 py-20 pt-32"
      data-tour="hero-terminal"
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <Hero
          terminalOpen={terminalOpen}
          terminalState={terminalState}
          onTerminalClick={onTerminalClick}
          onToggleSearch={onToggleSearch}
          onToggleMobilePreview={onToggleMobilePreview}
          onToggleTechVisualizer={onToggleTechVisualizer}
          onToggleChatbot={onToggleChatbot}
          onToggleMusic={onToggleMusic}
          onToggleTheme={onToggleTheme}
          onTriggerGame={onTriggerGame}
          onTriggerSurprise={onTriggerSurprise}
          onToggleSettings={onToggleSettings}
        />
      </div>
    </section>
  );
}

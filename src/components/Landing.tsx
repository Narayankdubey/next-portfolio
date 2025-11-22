import Hero from "./Hero";

interface LandingProps {
  terminalOpen: boolean;
  terminalState: "normal" | "minimized" | "maximized";
  onTerminalClick: () => void;
}

export default function Landing({ terminalOpen, terminalState, onTerminalClick }: LandingProps) {
  return (
    <section
      className="min-h-screen flex items-center md:px-8 py-20 pt-32"
      data-tour="hero-terminal"
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <Hero
          terminalOpen={terminalOpen}
          terminalState={terminalState}
          onTerminalClick={onTerminalClick}
        />
      </div>
    </section>
  );
}

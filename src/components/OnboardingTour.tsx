"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useFeatureFlags } from "@/context/FeatureFlagsContext";
import styles from "./OnboardingTour.module.css";

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  action?: () => void; // Optional action to trigger when step starts
  requiresFlag?: string; // Feature flag required for this step
}

interface OnboardingTourProps {
  onOpenChatbot?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="hero-terminal"]',
    title: "Interactive Terminal",
    content:
      "Start here! Use the terminal to explore my portfolio with commands, or just scroll down for the visual experience.",
    position: "bottom",
  },
  {
    target: '[data-tour="nav"]',
    title: "Navigation",
    content: "Quickly jump between sections like About, Experience, and Projects.",
    position: "bottom",
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: "Theme Customization",
    content: "Switch between Light and Dark modes to match your vibe.",
    position: "left",
  },
  {
    target: '[data-tour="blog-widget"]',
    title: "Blog & Insights",
    content: "Read my latest thoughts on tech, tutorials, and project breakdowns.",
    position: "top",
  },
  {
    target: '[data-tour="chatbot"]',
    title: "AI Assistant 🤖",
    content: "Need help? Ask my AI assistant anything about my skills, experience, or projects!",
    position: "right",
  },
  {
    target: '[data-tour="quick-actions"]',
    title: "Quick Actions",
    content: "Fast access to my Resume, GitHub, LinkedIn, and Email.",
    position: "left",
    requiresFlag: "quickActions",
  },
  {
    target: '[data-tour="quick-actions"]', // Anchored to Quick Actions but content focuses on Cmd+K
    title: "Power User Tools ⚡",
    content:
      "Press Cmd+K (or Ctrl+K) to open the Command Palette. From there, you can launch the Music Player 🎵, Tech Visualizer, and more!",
    position: "left",
    requiresFlag: "commandPalette",
  },
];

const FEATURES_LIST = [
  { icon: "💻", title: "Interactive Terminal", desc: "Type commands to explore" },
  { icon: "📝", title: "Tech Blog", desc: "Tutorials & insights" },
  { icon: "🎨", title: "Theme Customizer", desc: "Personalize the look" },
  { icon: "⌨️", title: "Command Palette", desc: "Cmd+K for quick actions" },
  { icon: "🤖", title: "AI Chatbot", desc: "Ask me anything" },
  { icon: "🎵", title: "Music Player", desc: "Vibe while you browse" },
];

export default function OnboardingTour({ onOpenChatbot }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = Welcome Modal
  const [rect, setRect] = useState<DOMRect | null>(null);
  const flags = useFeatureFlags();

  // Filter steps based on active feature flags
  const activeSteps = useMemo(() => {
    return TOUR_STEPS.filter(
      (step) =>
        !step.requiresFlag || flags.features[step.requiresFlag as keyof typeof flags.features]
    );
  }, [flags.features]);

  // Helper functions defined before use
  const getTarget = useCallback(
    (stepIndex: number): Element | null => {
      const step = activeSteps[stepIndex];
      // Guard against out of bounds or undefined step
      if (!step) return null;

      try {
        // Try selector directly
        let target = document.querySelector(step.target);

        // Fallback for nav if using data attribute fails
        if (!target && step.target.includes("nav")) {
          target = document.querySelector("header");
        }

        return target;
      } catch (e) {
        console.warn("Invalid selector:", step.target);
        return null;
      }
    },
    [activeSteps]
  );

  const updateRect = useCallback(() => {
    if (currentStep < 0) return;
    const target = getTarget(currentStep);
    if (target) {
      setRect(target.getBoundingClientRect());
    }
  }, [currentStep, getTarget]);

  const handleFinish = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  }, []);

  const handleStart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, activeSteps.length, handleFinish]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      // Small delay to ensure loading is done
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < activeSteps.length) {
      const step = activeSteps[currentStep];

      // Execute step action if defined (e.g. open chatbot)
      if (step.target === '[data-tour="chatbot"]' && onOpenChatbot) {
        onOpenChatbot();
        // Small delay to allow modal to open before calculating rect
        setTimeout(() => {
          const target = getTarget(currentStep);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            updateRect();
          }
        }, 300);
        return;
      }

      const target = getTarget(currentStep);
      if (target) {
        // Only scroll if not fully visible
        const rect = target.getBoundingClientRect();
        const isVisible =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (!isVisible) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Update rect after a small delay to allow scroll to start/layout to settle
        setTimeout(updateRect, 100);
      } else {
        handleNext(); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [currentStep, activeSteps, onOpenChatbot, getTarget, updateRect, handleNext]);

  useEffect(() => {
    if (currentStep >= 0) {
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect);
      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect);
      };
    }
  }, [currentStep, updateRect]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Welcome Modal */}
      {currentStep === -1 && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.welcomeModal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button onClick={handleFinish} className={styles.closeButton}>
              <X size={24} />
            </button>

            <div className={styles.welcomeHeader}>
              <h1>Welcome to My Portfolio! 🚀</h1>
              <p>Discover what makes this site unique.</p>
            </div>

            <div className={styles.featuresGrid}>
              {FEATURES_LIST.map((feature, idx) => (
                <div key={idx} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.welcomeActions}>
              <button onClick={handleFinish} className={styles.skipButton}>
                Skip Tour
              </button>
              <button onClick={handleStart} className={styles.startButton}>
                Start Tour <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tour Steps */}
      {currentStep >= 0 && rect && (
        <>
          {/* Spotlight Overlay */}
          <div className={styles.spotlightOverlay}>
            <div
              className={styles.spotlight}
              style={{
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
              }}
            />
          </div>

          {/* Tooltip */}
          <motion.div
            className={styles.tooltip}
            style={{
              // Clamp to viewport (considering scroll)
              top: Math.max(
                window.scrollY + 20,
                Math.min(
                  window.scrollY + window.innerHeight - 250,
                  rect.top +
                    window.scrollY +
                    (activeSteps[currentStep].position === "bottom" ? rect.height + 20 : -150)
                )
              ),
              left: Math.max(
                window.scrollX + 20,
                Math.min(
                  window.scrollX + window.innerWidth - 340,
                  rect.left + window.scrollX + rect.width / 2 - 150
                )
              ),
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentStep}
          >
            <div className={styles.tooltipHeader}>
              <span>
                {currentStep + 1} / {activeSteps.length}
              </span>
              <button onClick={handleFinish}>
                <X size={16} />
              </button>
            </div>
            <h3>{activeSteps[currentStep].title}</h3>
            <p>{activeSteps[currentStep].content}</p>

            <div className={styles.tooltipActions}>
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={styles.navButton}
              >
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNext} className={styles.nextButton}>
                {currentStep === activeSteps.length - 1 ? "Finish" : "Next"}
                {currentStep === activeSteps.length - 1 ? (
                  <Check size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

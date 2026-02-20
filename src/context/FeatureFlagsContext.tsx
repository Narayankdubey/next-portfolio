"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
const defaultFlags = {
  sections: {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    testimonials: true,
    certificates: true,
    contact: true,
  },
  features: {
    floatingTerminal: true,
    chatbot: true,
    commandPalette: true,
    searchModal: true,
    musicPlayer: true,
    themeCustomizer: true,
    achievementSystem: true,
    konamiCode: true,
    particleCursor: true,
    clickCounter: true,
    toastNotifications: true,
    interactiveBackground: true,
    githubHeatmap: true,
    techVisualizer: true,
    skillRadar: true,
    mobilePreview: true,
    quickActions: true,
    blog: true,
    techMarquee: true,
    openToWork: true,
  },
  userCustomizable: {
    sections: [],
    features: [],
  },
  devMode: {
    showFeatureToggles: false,
    enableDebugLogs: false,
  },
};

interface FeatureFlags {
  sections: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    testimonials: boolean;
    certificates: boolean;
    contact: boolean;
  };
  features: {
    floatingTerminal: boolean;
    chatbot: boolean;
    commandPalette: boolean;
    searchModal: boolean;
    musicPlayer: boolean;
    themeCustomizer: boolean;
    achievementSystem: boolean;
    konamiCode: boolean;
    particleCursor: boolean;
    clickCounter: boolean;
    toastNotifications: boolean;
    interactiveBackground: boolean;
    githubHeatmap: boolean;
    techVisualizer: boolean;
    skillRadar: boolean;
    mobilePreview: boolean;
    quickActions: boolean;
    blog: boolean;
    techMarquee: boolean;
    openToWork: boolean;
  };
  userCustomizable: {
    sections: string[];
    features: string[];
  };
  devMode: {
    showFeatureToggles: boolean;
    enableDebugLogs: boolean;
  };
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleFeature: (feature: keyof FeatureFlags["features"]) => void;
  toggleSection: (section: keyof FeatureFlags["sections"]) => void;
  resetToDefaults: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const STORAGE_KEY = "portfolio-feature-flags";

function loadUserPreferences(): Partial<FeatureFlags> {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to load feature flags from localStorage:", error);
    return {};
  }
}

function saveUserPreferences(flags: FeatureFlags) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sections: flags.sections,
        features: flags.features,
      })
    );
  } catch (error) {
    console.error("Failed to save feature flags to localStorage:", error);
  }
}

export function FeatureFlagsProvider({
  children,
  initialFlags,
}: {
  children: ReactNode;
  initialFlags?: FeatureFlags;
}) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const userPrefs = loadUserPreferences();
    const baseFlags = initialFlags || defaultFlags;

    return {
      sections: { ...baseFlags.sections, ...userPrefs.sections },
      features: { ...baseFlags.features, ...userPrefs.features },
      userCustomizable: baseFlags.userCustomizable,
      devMode: baseFlags.devMode,
    };
  });

  // Save to localStorage whenever flags change
  useEffect(() => {
    saveUserPreferences(flags);
  }, [flags]);

  const toggleFeature = (feature: keyof FeatureFlags["features"]) => {
    setFlags((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  const toggleSection = (section: keyof FeatureFlags["sections"]) => {
    setFlags((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  };

  const resetToDefaults = () => {
    const resetFlags = {
      sections: { ...defaultFlags.sections },
      features: { ...defaultFlags.features },
      userCustomizable: defaultFlags.userCustomizable,
      devMode: defaultFlags.devMode,
    };
    setFlags(resetFlags);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, toggleFeature, toggleSection, resetToDefaults }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  }
  return context.flags;
}

export function useFeatureFlagsActions() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlagsActions must be used within FeatureFlagsProvider");
  }
  return {
    toggleFeature: context.toggleFeature,
    toggleSection: context.toggleSection,
    resetToDefaults: context.resetToDefaults,
  };
}

// Convenience hooks for common checks
export function useIsFeatureEnabled(feature: keyof FeatureFlags["features"]): boolean {
  const flags = useFeatureFlags();
  return flags.features[feature];
}

export function useIsSectionEnabled(section: keyof FeatureFlags["sections"]): boolean {
  const flags = useFeatureFlags();
  return flags.sections[section];
}

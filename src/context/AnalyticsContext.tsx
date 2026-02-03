"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { generateFingerprint } from "@/utils/fingerprint";

interface AnalyticsSession {
  sessionId: string;
  visitorId: string;
}

interface AnalyticsContextType {
  session: AnalyticsSession | null;
  isInitialized: boolean;
  trackSection: (
    sectionId: string,
    interactionId: string,
    options?: { duration?: number; scrollDepth?: number; interactions?: number }
  ) => Promise<void>;
  trackAction: (type: string, target: string, metadata?: Record<string, any>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Storage keys
const SESSION_KEY = "portfolio_session_id";
const VISITOR_KEY = "portfolio_visitor_id";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AnalyticsSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationPromise = useRef<Promise<void> | null>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      // Prevent double initialization in strict mode or race conditions
      if (initializationPromise.current) return;

      // Don't track admin pages
      if (window.location.pathname.startsWith("/admin")) return;

      let resolveInit: () => void;
      initializationPromise.current = new Promise((resolve) => {
        resolveInit = resolve;
      });

      try {
        // Get or generate visitor ID
        let visitorId = localStorage.getItem(VISITOR_KEY);
        if (!visitorId) {
          visitorId = await generateFingerprint();
          localStorage.setItem(VISITOR_KEY, visitorId);
        }

        // Check if we have an active session (within last 30 minutes)
        const existingSessionId = sessionStorage.getItem(SESSION_KEY);
        if (existingSessionId) {
          setSession({ sessionId: existingSessionId, visitorId });
          setIsInitialized(true);
          return;
        }

        // Create new session
        const landingPage = window.location.pathname;
        const referrer = document.referrer;
        const userAgent = navigator.userAgent;

        const response = await fetch("/api/analytics/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            landingPage,
            referrer,
            userAgent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          sessionStorage.setItem(SESSION_KEY, data.sessionId);
          setSession({ sessionId: data.sessionId, visitorId });
        }
      } catch (error) {
        console.error("Analytics initialization failed:", error);
      } finally {
        setIsInitialized(true);
        resolveInit!();
      }
    };

    initSession();
  }, []);

  // Track section impression
  const trackSection = useCallback(
    async (
      sectionId: string,
      interactionId: string,
      options?: { duration?: number; scrollDepth?: number; interactions?: number }
    ) => {
      if (!session?.sessionId) return;

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            interactionId,
            sectionId,
            duration: options?.duration || 0,
            scrollDepth: options?.scrollDepth || 0,
            interactions: options?.interactions || 0,
          }),
        });
      } catch (error) {
        console.error("Section tracking failed:", error);
      }
    },
    [session]
  );

  // Track generic action
  const trackAction = useCallback(
    async (type: string, target: string, metadata?: Record<string, any>) => {
      if (!session?.sessionId) return;

      try {
        await fetch("/api/analytics/action", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            type,
            target,
            metadata,
          }),
        });
      } catch (error) {
        console.error("Action tracking failed:", error);
      }
    },
    [session]
  );

  return (
    <AnalyticsContext.Provider value={{ session, isInitialized, trackSection, trackAction }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

import { useRef } from "react";

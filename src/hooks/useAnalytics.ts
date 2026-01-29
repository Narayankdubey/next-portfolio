"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { generateFingerprint } from "@/utils/fingerprint";

interface AnalyticsSession {
  sessionId: string;
  visitorId: string;
}

// Storage keys
const SESSION_KEY = "portfolio_session_id";
const VISITOR_KEY = "portfolio_visitor_id";

export function useAnalytics() {
  const [session, setSession] = useState<AnalyticsSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
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
      }
    };

    initSession();
  }, []);

  // Track section impression
  const trackSection = useCallback(
    async (
      sectionId: string,
      options?: { duration?: number; scrollDepth?: number; interactions?: number }
    ) => {
      if (!session?.sessionId) return;

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
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

  return { session, isInitialized, trackSection };
}

// Hook for tracking section visibility
export function useSectionTracking(sectionId: string) {
  const { trackSection, isInitialized } = useAnalytics();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const maxScrollDepthRef = useRef(0);
  const hasTrackedRef = useRef(false);

  const calculateScrollDepth = useCallback(() => {
    if (!sectionRef.current) return 0;

    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = rect.height;

    if (rect.top >= windowHeight || rect.bottom <= 0) return 0;

    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(sectionHeight, windowHeight - rect.top);
    const visibleHeight = visibleBottom - visibleTop;

    return Math.round((visibleHeight / sectionHeight) * 100);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Section came into view
          if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
            hasTrackedRef.current = true;

            // Track initial impression
            trackSection(sectionId, { scrollDepth: 0 });
          }

          // Update scroll depth
          const scrollDepth = calculateScrollDepth();
          if (scrollDepth > maxScrollDepthRef.current) {
            maxScrollDepthRef.current = scrollDepth;
          }
        } else if (startTimeRef.current) {
          // Section left view - track duration
          const duration = Date.now() - startTimeRef.current;
          trackSection(sectionId, {
            duration,
            scrollDepth: maxScrollDepthRef.current,
          });
          startTimeRef.current = null;
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: "0px",
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Final tracking on unmount
      if (startTimeRef.current && hasTrackedRef.current) {
        const duration = Date.now() - startTimeRef.current;
        trackSection(sectionId, {
          duration,
          scrollDepth: maxScrollDepthRef.current,
        });
      }
    };
  }, [isInitialized, sectionId, trackSection, calculateScrollDepth]);

  // Return ref to attach to section element
  const attachRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      sectionRef.current = node;
      if (observerRef.current) {
        observerRef.current.observe(node);
      }
    }
  }, []);

  return attachRef;
}

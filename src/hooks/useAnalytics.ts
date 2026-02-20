import { useRef, useEffect, useCallback } from "react";
import { useAnalytics as useAnalyticsContext } from "@/context/AnalyticsContext";

// Export the hook from context for backward compatibility
export { useAnalytics } from "@/context/AnalyticsContext";

// Hook for tracking section visibility
export function useSectionTracking(sectionId: string) {
  const { trackSection, isInitialized } = useAnalyticsContext();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const maxScrollDepthRef = useRef(0);
  const hasTrackedRef = useRef(false);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const interactionIdRef = useRef<string | null>(null);

  const calculateScrollDepth = useCallback(() => {
    // ... (unchanged)
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
        const isHighlyVisible =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.7 ||
            entry.intersectionRect.height / window.innerHeight >= 0.7);

        const isPartiallyVisible = entry.isIntersecting && entry.intersectionRatio > 0;

        if (isHighlyVisible) {
          // Section came into view strongly enough
          if (!startTimeRef.current && !viewTimerRef.current) {
            viewTimerRef.current = setTimeout(() => {
              startTimeRef.current = Date.now();
              hasTrackedRef.current = true;
              // Generate unique interaction ID for this visit
              interactionIdRef.current = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              // Track initial impression
              trackSection(sectionId, interactionIdRef.current, { scrollDepth: 0 });
            }, 1000);
          }

          // Update scroll depth
          if (startTimeRef.current) {
            const scrollDepth = calculateScrollDepth();
            if (scrollDepth > maxScrollDepthRef.current) {
              maxScrollDepthRef.current = scrollDepth;
            }
          }
        } else if (isPartiallyVisible) {
          // If we haven't locked in yet, cancel the start timer because it dipped below 70%
          if (!startTimeRef.current && viewTimerRef.current) {
            clearTimeout(viewTimerRef.current);
            viewTimerRef.current = null;
          }

          // If we HAVE locked in, keep the duration running and just update scroll depth
          if (startTimeRef.current) {
            const scrollDepth = calculateScrollDepth();
            if (scrollDepth > maxScrollDepthRef.current) {
              maxScrollDepthRef.current = scrollDepth;
            }
          }
        } else {
          // Completely off screen
          if (viewTimerRef.current) {
            clearTimeout(viewTimerRef.current);
            viewTimerRef.current = null;
          }

          if (startTimeRef.current && interactionIdRef.current) {
            // Section left view - track duration
            const duration = Date.now() - startTimeRef.current;
            trackSection(sectionId, interactionIdRef.current, {
              duration,
              scrollDepth: maxScrollDepthRef.current,
            });
            startTimeRef.current = null;
            interactionIdRef.current = null;
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      rootMargin: "0px",
    });

    // Start observing if ref is already attached
    if (sectionRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Cleanup timer
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }

      // Final tracking on unmount
      if (startTimeRef.current && hasTrackedRef.current && interactionIdRef.current) {
        const duration = Date.now() - startTimeRef.current;
        trackSection(sectionId, interactionIdRef.current, {
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

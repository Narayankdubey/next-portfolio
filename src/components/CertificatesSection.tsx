import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Stamp } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function CertificatesSection() {
  const portfolio = usePortfolio();
  const { trackAction } = useAnalytics();
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trackedRef = useRef(false);

  // Track when section is viewed
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isHighlyVisible =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.7 ||
            entry.intersectionRect.height / window.innerHeight >= 0.7);

        const isPartiallyVisible = entry.isIntersecting && entry.intersectionRatio > 0;

        if (isHighlyVisible && !trackedRef.current) {
          if (!viewTimerRef.current) {
            viewTimerRef.current = setTimeout(() => {
              trackAction("view", "certificates-section");
              trackedRef.current = true;
            }, 1000);
          }
        } else if (isPartiallyVisible) {
          if (viewTimerRef.current && !trackedRef.current) {
            clearTimeout(viewTimerRef.current);
            viewTimerRef.current = null;
          }
        } else {
          if (viewTimerRef.current && !trackedRef.current) {
            clearTimeout(viewTimerRef.current);
            viewTimerRef.current = null;
          }
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    const element = document.getElementById("certificates");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    };
  }, [trackAction]);

  if (!portfolio || !portfolio.certificates || portfolio.certificates.length === 0) {
    return null;
  }

  const certificates = portfolio.certificates;

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % certificates.length;
      trackAction("click", "certificate-next", { title: certificates[nextIdx].title });
      return nextIdx;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const prevIdx = (prev - 1 + certificates.length) % certificates.length;
      trackAction("click", "certificate-prev", { title: certificates[prevIdx].title });
      return prevIdx;
    });
  };

  const activeCert = certificates[currentIndex];

  return (
    <section id="certificates" className="py-20 px-4 md:px-8 bg-gray-50/5 dark:bg-gray-900/5">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-12"
        >
          <Stamp className="w-8 h-8 text-green-500" />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Certificates
          </h2>
        </motion.div>

        <div className="relative theme-card border theme-border rounded-3xl p-4 md:p-8 overflow-hidden theme-shadow group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row gap-8 items-center"
            >
              {/* Certificate Media */}
              <div className="w-full md:w-3/5 rounded-2xl overflow-hidden border theme-border bg-black/5 dark:bg-white/5 aspect-[4/3] md:aspect-video relative flex items-center justify-center">
                {activeCert.type === "iframe" ? (
                  <iframe
                    src={activeCert.url}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={activeCert.title}
                  />
                ) : (
                  <img
                    src={activeCert.url}
                    alt={activeCert.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Certificate Details */}
              <div className="w-full md:w-2/5 flex flex-col justify-center space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-semibold tracking-wide w-max mb-2">
                  {activeCert.provider}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold theme-text leading-tight">
                  {activeCert.title}
                </h3>

                <div className="pt-6">
                  <a
                    href={activeCert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackAction("click", "certificate-link", { title: activeCert.title })
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-green-500/25"
                  >
                    View Credential <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {certificates.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md border border-white/10 text-gray-800 dark:text-white transition-all shadow-xl hover:scale-110"
                aria-label="Previous certificate"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md border border-white/10 text-gray-800 dark:text-white transition-all shadow-xl hover:scale-110"
                aria-label="Next certificate"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Indicators */}
          {certificates.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {certificates.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-green-500 w-6"
                      : "bg-gray-400/50 hover:bg-gray-400/80"
                  }`}
                  aria-label={`Go to certificate ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

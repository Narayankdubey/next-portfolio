"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { usePortfolio } from "@/context/PortfolioContext";
import { useSectionTracking } from "@/hooks/useAnalytics";

export default function TestimonialCarousel() {
  const portfolio = usePortfolio();
  const testimonials = portfolio?.testimonials || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonialsRef = useSectionTracking("testimonials");

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <div
      ref={testimonialsRef}
      id="testimonials"
      className="relative w-full max-w-4xl mx-auto py-20 px-4 overflow-hidden"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
          What People Say
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
      </div>

      <div className="relative h-[300px] flex items-center justify-center perspective-1000">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.4 },
            }}
            className="absolute w-full max-w-lg"
          >
            <div className="theme-card border theme-border p-8 rounded-2xl shadow-2xl relative group hover:border-blue-500/50 transition-colors">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {testimonials[currentIndex]?.avatar}
                </div>
                <div>
                  <h3 className="font-bold theme-text text-lg">
                    {testimonials[currentIndex]?.name}
                  </h3>
                  <p className="text-sm theme-text-secondary">{testimonials[currentIndex]?.role}</p>
                </div>
              </div>

              <p className="theme-text text-lg leading-relaxed italic">
                &quot;{testimonials[currentIndex]?.text}&quot;
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 md:left-4 z-10 p-3 rounded-full theme-card border theme-border hover:bg-blue-500/10 hover:border-blue-500 transition-all group"
        >
          <ChevronLeft className="w-6 h-6 theme-text group-hover:text-blue-400" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 md:right-4 z-10 p-3 rounded-full theme-card border theme-border hover:bg-blue-500/10 hover:border-blue-500 transition-all group"
        >
          <ChevronRight className="w-6 h-6 theme-text group-hover:text-blue-400" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-blue-500" : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

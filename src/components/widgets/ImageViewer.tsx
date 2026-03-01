"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCcw } from "lucide-react";

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotateLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => prev + 90);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
    setRotation(0);
  };

  // Keyboard support for closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Controls Toolbar */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-black/50 dark:bg-black/80 backdrop-blur-md border border-white/20 shadow-xl shadow-black/50 z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button
            onClick={handleRotateLeft}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Rotate Left"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleRotateRight}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Rotate Right"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Reset"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 rounded-full hover:bg-white/20 text-white bg-black/50 dark:bg-black/80 backdrop-blur-md border border-white/20 transition-colors shadow-xl shadow-black/50 z-[10000]"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Container */}
        <div className="w-full h-full p-12 flex items-center justify-center overflow-hidden">
          <motion.img
            src={src}
            alt={alt}
            animate={{ scale, rotate: rotation }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            drag
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}

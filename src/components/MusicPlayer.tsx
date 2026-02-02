"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from "lucide-react";

import { usePortfolio } from "@/context/PortfolioContext";
import { useAnalytics } from "@/context/AnalyticsContext";

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MusicPlayer({ isOpen, onClose }: MusicPlayerProps) {
  const portfolio = usePortfolio();
  const playlist = portfolio?.playlist || [];
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const { trackAction } = useAnalytics();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    trackAction("click", "music-control", {
      action: isPlaying ? "pause" : "play",
      track: playlist[currentTrack]?.title,
    });
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      const nextTrack = (currentTrack + 1) % playlist.length;
      setCurrentTrack(nextTrack);
      trackAction("click", "music-control", { action: "next", track: playlist[nextTrack]?.title });
    }
  };

  const handlePrev = () => {
    if (playlist.length > 0) {
      const prevTrack = (currentTrack - 1 + playlist.length) % playlist.length;
      setCurrentTrack(prevTrack);
      trackAction("click", "music-control", { action: "prev", track: playlist[prevTrack]?.title });
    }
  };

  if (!portfolio || playlist.length === 0) return null;

  return (
    <>
      {/* Player Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-72 theme-card border theme-border rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--accent-primary)] p-2 flex items-center justify-between cursor-move">
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Music className="w-3 h-3" />
                <span>WINAMP_2077.exe</span>
              </div>
              <button
                onClick={() => {
                  trackAction("click", "modal-close", {
                    modalId: "music-player",
                    title: "Music Player",
                  });
                  onClose();
                }}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Display */}
            <div className="theme-card p-3 font-mono text-[var(--accent-primary)] text-xs relative overflow-hidden">
              <div className="flex justify-between mb-1">
                <span>{isPlaying ? "PLAYING" : "PAUSED"}</span>
                <span>{playlist[currentTrack].duration}</span>
              </div>
              <div className="whitespace-nowrap overflow-hidden">
                <motion.div
                  animate={{ x: ["100%", "-100%"] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                >
                  {playlist[currentTrack].artist} - {playlist[currentTrack].title} ***{" "}
                  {playlist[currentTrack].artist} - {playlist[currentTrack].title}
                </motion.div>
              </div>

              {/* Visualizer Simulation */}
              <div className="flex items-end gap-0.5 h-8 mt-2 opacity-80">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-[var(--accent-primary)]"
                    animate={{
                      height: isPlaying ? ["10%", "90%", "30%", "70%"] : "10%",
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5,
                      delay: i * 0.05,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="p-3 theme-card backdrop-blur">
              <div className="flex items-center justify-center gap-4 mb-3">
                <button
                  onClick={handlePrev}
                  className="theme-text-secondary hover:text-[var(--accent-primary)] transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
                <button
                  onClick={handleNext}
                  className="theme-text-secondary hover:text-[var(--accent-primary)] transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    trackAction("click", "music-control", {
                      action: isMuted ? "unmute" : "mute",
                      volume,
                    });
                  }}
                  className="theme-text-secondary hover:text-[var(--accent-primary)]"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    trackAction("change", "music-control", { action: "volume", value: newVolume });
                  }}
                  className="w-full h-1 theme-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--accent-primary)] [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

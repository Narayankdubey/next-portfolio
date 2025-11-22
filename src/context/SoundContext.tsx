"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SoundContextType {
  playHover: () => void;
  playClick: () => void;
  playTyping: () => void;
  playSuccess: () => void;
  playError: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const savedMute = localStorage.getItem("portfolio-muted");
    if (savedMute) setTimeout(() => setIsMuted(savedMute === "true"), 0);

    // Initialize AudioContext on first user interaction to comply with browser policies
    const initAudio = () => {
      if (!audioCtx) {
        const ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioCtx(ctx);
      }
    };

    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("keydown", initAudio, { once: true });

    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("portfolio-muted", String(isMuted));
    }
  }, [isMuted, audioCtx]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const createOscillator = (
    type: OscillatorType,
    freq: number,
    duration: number,
    vol: number = 0.1
  ) => {
    if (!audioCtx || isMuted) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  const playHover = () => {
    // High pitch chirp
    createOscillator("sine", 800, 0.05, 0.02);
  };

  const playClick = () => {
    // Mechanical click
    createOscillator("square", 300, 0.05, 0.05);
  };

  const playTyping = () => {
    // Soft typing sound
    createOscillator("triangle", 400 + Math.random() * 200, 0.03, 0.03);
  };

  const playSuccess = () => {
    // Success chime
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;

    const playNote = (freq: number, time: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    };

    playNote(440, now);
    playNote(554, now + 0.1);
    playNote(659, now + 0.2);
  };

  const playError = () => {
    // Error buzz
    createOscillator("sawtooth", 150, 0.2, 0.05);
  };

  return (
    <SoundContext.Provider
      value={{ playHover, playClick, playTyping, playSuccess, playError, isMuted, toggleMute }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return context;
}

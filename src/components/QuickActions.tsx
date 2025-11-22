"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Github, Linkedin, Mail, Share2, Copy, Check, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useSound } from "@/context/SoundContext";
import { usePortfolio } from "@/context/PortfolioContext";

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();
  const { playHover, playClick, playSuccess } = useSound();
  const portfolio = usePortfolio();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showSuccess("Link copied to clipboard!");
    playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    {
      icon: <Github className="w-5 h-5" />,
      label: "GitHub",
      onClick: () => window.open(portfolio?.social?.github || "", "_blank"),
      color: "bg-gray-800",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: "LinkedIn",
      onClick: () => window.open(portfolio?.social?.linkedin || "", "_blank"),
      color: "bg-blue-600",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      onClick: () => (window.location.href = `mailto:${portfolio?.social?.email || ""}`),
      color: "bg-red-500",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Resume",
      onClick: () => window.open("/resume", "_blank"),
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  playClick();
                }}
                onMouseEnter={playHover}
                className={`flex items-center gap-3 p-3 rounded-full shadow-lg text-white ${action.color} hover:brightness-110 transition-all group cursor-pointer`}
              >
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 absolute right-14 bg-black/80 px-2 py-1 rounded text-white whitespace-nowrap transition-opacity pointer-events-none">
                  {action.label}
                </span>
                {action.icon}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: actions.length * 0.05 }}
              onClick={() => {
                handleCopyLink();
                playClick();
              }}
              onMouseEnter={playHover}
              className="flex items-center gap-3 p-3 rounded-full shadow-lg text-white bg-indigo-500 hover:brightness-110 transition-all group cursor-pointer"
            >
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 absolute right-14 bg-black/80 px-2 py-1 rounded text-white whitespace-nowrap transition-opacity pointer-events-none">
                {copied ? "Copied!" : "Copy Link"}
              </span>
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          playClick();
        }}
        onMouseEnter={playHover}
        className={`p-4 rounded-full shadow-2xl text-white transition-colors cursor-pointer ${
          isOpen ? "bg-red-500 rotate-45" : "bg-gradient-to-r from-blue-600 to-purple-600"
        }`}
        data-tour="quick-actions"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}

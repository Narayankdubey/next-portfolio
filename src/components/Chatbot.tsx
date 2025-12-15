"use client";

import { motion, AnimatePresence } from "framer-motion";
import ChatInterface from "./ChatInterface";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-8 z-50 w-80 md:w-96 max-w-[90vw] h-[500px] max-h-[80vh] theme-bg border theme-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            data-tour="chatbot"
          >
            <ChatInterface onClose={onClose} isModal={true} className="h-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

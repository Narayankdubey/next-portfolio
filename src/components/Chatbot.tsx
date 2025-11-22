"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User } from "lucide-react";
import { useSound } from "@/context/SoundContext";
import { usePortfolio } from "@/context/PortfolioContext";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const portfolio = usePortfolio();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm Narayan's AI assistant. Ask me anything about his skills, experience, or projects! 🤖",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playClick, playTyping, playSuccess } = useSound();

  // Initialize user ID and load chat history
  useEffect(() => {
    // Get or create user ID
    let id = localStorage.getItem("chatUserId");
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("chatUserId", id);
    }
    setUserId(id);

    // Load chat history
    loadChatHistory(id);
  }, []);

  const loadChatHistory = async (uid: string) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/chat/history?userId=${uid}`);

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();

      // Convert to message format
      const historyMessages: Message[] = data.messages.flatMap((m: any) => [
        {
          id: `${m.timestamp}-user`,
          text: m.message,
          sender: "user" as const,
          timestamp: new Date(m.timestamp),
        },
        {
          id: `${m.timestamp}-bot`,
          text: m.response,
          sender: "bot" as const,
          timestamp: new Date(m.timestamp),
        },
      ]);

      // Only add history if there are messages
      if (historyMessages.length > 0) {
        setMessages((prev) => [
          prev[0], // Keep welcome message
          ...historyMessages,
        ]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Don't show error to user, just continue with empty history
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Scroll to bottom when chatbot opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !userId) return;

    playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const messageText = input;
    setInput("");
    setIsTyping(true);

    try {
      // Call backend API with userId
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, botMsg]);
      playSuccess();
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

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
            {/* Header */}
            <div className="p-4 bg-[var(--accent-primary)] text-white flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  playClick();
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === "user" ? "bg-[var(--accent-primary)]" : "bg-purple-600"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 theme-text rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="theme-card p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t theme-border theme-bg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    playTyping();
                  }}
                  placeholder="Ask something..."
                  className="flex-1 px-4 py-2 rounded-full theme-input-bg border theme-border focus:border-blue-500 outline-none theme-text text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-[var(--accent-primary)] text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

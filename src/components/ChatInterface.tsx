"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Send, X, Bot, User } from "lucide-react";
import { useSound } from "@/context/SoundContext";
import { useAnalytics } from "@/context/AnalyticsContext";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export interface ChatInterfaceRef {
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

interface ChatInterfaceProps {
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
}

const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(
  ({ onClose, isModal = false, className = "" }, ref) => {
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
    const { trackAction } = useAnalytics();

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

    const processMessage = async (messageText: string) => {
      if (!messageText.trim() || !userId) return;

      playClick();
      trackAction("send", "chatbot-message", { message: messageText, length: messageText.length });
      const userMsg: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
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

    const handleSend = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;
      const text = input;
      setInput("");
      await processMessage(text);
    };

    useImperativeHandle(ref, () => ({
      sendMessage: (text: string) => {
        processMessage(text);
      },
      clearChat: () => {
        setMessages([
          {
            id: "welcome",
            text: "Hi! I'm Narayan's AI assistant. Ask me anything about his skills, experience, or projects! 🤖",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      },
    }));

    return (
      <div className={`flex flex-col overflow-hidden ${className}`}>
        {/* Header */}
        <div
          className={`p-4 bg-[var(--accent-primary)] text-white flex items-center justify-between shadow-xl ${isModal ? "rounded-t-2xl" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          {onClose && (
            <button
              onClick={() => {
                trackAction("click", "modal-close", { modalId: "chatbot", title: "AI Assistant" });
                onClose();
                playClick();
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 theme-bg">
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
                    : "theme-card theme-text rounded-tl-none border theme-border shadow-md"
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
        <form
          onSubmit={handleSend}
          className={`p-4 border-t theme-border theme-bg ${isModal ? "rounded-b-2xl" : ""}`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                playTyping();
              }}
              onBlur={() => {
                if (input.trim()) {
                  trackAction("input", "chatbot-message", { message: input, length: input.length });
                }
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
      </div>
    );
  }
);

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;

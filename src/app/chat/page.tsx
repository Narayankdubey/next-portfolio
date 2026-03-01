"use client";

import { useRef } from "react";
import ChatInterface, { ChatInterfaceRef } from "@/components/features/chat/ChatInterface";
import Navbar from "@/components/layout/Navbar";
import { MessageSquare, HelpCircle } from "lucide-react";

export default function ChatPage() {
  const chatRef = useRef<ChatInterfaceRef>(null);

  const suggestedQuestions = [
    "Tell me about yourself",
    "What are your technical skills?",
    "Show me your best projects",
    "How can I contact you?",
    "Do you have experience with React?",
    "What is your educational background?",
  ];

  const handleQuestionClick = (question: string) => {
    chatRef.current?.sendMessage(question);
  };

  return (
    <main className="h-screen theme-bg theme-text flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex pt-20 pb-6 px-6 gap-6 h-full max-w-[1600px] mx-auto w-full">
        {/* Desktop Sidebar Card */}
        <div className="hidden md:flex w-80 flex-col theme-card border theme-border rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b theme-border bg-[var(--accent-primary)]/5">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold">
              <MessageSquare className="w-5 h-5" />
              <span>Chat Options</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-3 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent-primary)] flex-shrink-0 transition-colors" />
                    <span className="text-sm opacity-70 group-hover:opacity-100 line-clamp-2">
                      {question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t theme-border bg-gray-50 dark:bg-black/20">
            <div className="text-xs text-center opacity-50">AI Assistant v1.0</div>
          </div>
        </div>

        {/* Main Chat Card */}
        <div className="flex-1 flex flex-col h-full relative theme-card border theme-border rounded-2xl shadow-xl overflow-hidden">
          <ChatInterface ref={chatRef} className="h-full w-full" />
        </div>
      </div>
    </main>
  );
}

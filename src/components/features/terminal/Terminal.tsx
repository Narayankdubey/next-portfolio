"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";

type CommandHistory = {
  command: string;
  output: string | React.ReactNode;
};

type TerminalState = "closed" | "minimized" | "normal" | "maximized";

export default function Terminal() {
  const portfolio = usePortfolio();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    { command: "init", output: "Portfolio Terminal v1.0. Type 'help' for commands." },
  ]);
  const [state, setState] = useState<TerminalState>("normal");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();

    if (cmd === "clear") {
      setHistory([]);
    } else {
      let output: string | React.ReactNode = "";

      if (!portfolio) {
        output = "Loading data...";
      } else {
        switch (cmd) {
          case "help":
            output = (
              <div className="space-y-1">
                <p>Available commands:</p>
                <p className="text-blue-400">about - About me</p>
                <p className="text-blue-400">skills - My tech stack</p>
                <p className="text-blue-400">contact - Get in touch</p>
                <p className="text-blue-400">clear - Clear terminal</p>
              </div>
            );
            break;
          case "about":
            output = portfolio.about.bio.join(" ");
            break;
          case "skills":
            output = `Frontend: ${portfolio.skills.frontend.join(", ")}\nBackend: ${portfolio.skills.backend.join(", ")}\nTools: ${portfolio.skills.tools.join(", ")}`;
            break;
          case "contact":
            output = `Email: ${portfolio.personal.email} | Phone: ${portfolio.personal.phone}`;
            break;
          default:
            output = `Command not found: ${cmd}. Type 'help' for available commands.`;
        }
      }

      setHistory((prev) => [...prev, { command: input, output }]);
    }

    setInput("");
  };

  if (state === "closed") {
    return null;
  }

  const getWindowClasses = () => {
    switch (state) {
      case "maximized":
        return "fixed inset-4 top-20";
      case "normal":
        return "fixed bottom-4 right-4 w-[500px] h-[600px]";
      default:
        return "fixed bottom-4 right-4 w-[500px] h-[600px]";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`${getWindowClasses()} z-40 flex flex-col`}
      >
        <div className="bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden font-mono text-sm flex flex-col h-full">
          {/* Header with controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
            <span className="text-gray-400 flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs">guest@portfolio</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setState("minimized")}
                className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors"
                title="Minimize"
              />
              <button
                onClick={() => setState(state === "maximized" ? "normal" : "maximized")}
                className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors"
                title={state === "maximized" ? "Restore" : "Maximize"}
              />
              <button
                onClick={() => setState("closed")}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                title="Close"
              />
            </div>
          </div>

          {/* Terminal content */}
          {state !== "minimized" && (
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-2 text-gray-300 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-green-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <span>{item.command}</span>
                  </div>
                  <div className="pl-6 text-gray-300">{item.output}</div>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                <span className="text-green-400">➜</span>
                <span className="text-blue-400">~</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600"
                  placeholder="Type a command..."
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sidebar icon component
export function TerminalSidebar({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      whileHover={{ scale: 1.1 }}
      onClick={onOpen}
      className="fixed right-4 bottom-4 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      title="Open Terminal"
    >
      <TerminalIcon className="w-6 h-6 text-white" />
    </motion.button>
  );
}

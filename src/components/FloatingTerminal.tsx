"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, Minus, Square, Maximize2 } from "lucide-react";
import { useMinimizedWindows } from "@/context/MinimizedWindowsContext";
import { usePortfolio } from "@/context/PortfolioContext";

type CommandHistory = {
  command: string;
  output: string;
};

interface FloatingTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateChange?: (state: "normal" | "minimized" | "maximized") => void;
  terminalState?: "normal" | "minimized" | "maximized";
}

export default function FloatingTerminal({
  isOpen,
  onClose,
  onStateChange,
  terminalState = "normal",
}: FloatingTerminalProps) {
  const portfolio = usePortfolio();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: "welcome",
      output: "Welcome to my portfolio terminal! Type 'help' for available commands.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"normal" | "minimized" | "maximized">("normal");
  const { addWindow, removeWindow, getPosition } = useMinimizedWindows();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && state !== "minimized") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, state]);

  const handleMinimize = () => {
    if (state === "minimized") {
      setState("normal");
      removeWindow("terminal");
    } else {
      setState("minimized");
      addWindow({
        id: "terminal",
        title: "Terminal",
        onRestore: () => setState("normal"),
      });
    }
  };

  const handleMaximize = () => {
    setState(state === "maximized" ? "normal" : "maximized");
  };

  useEffect(() => {
    if (isOpen && inputRef.current && state !== "minimized") {
      inputRef.current.focus();
    }
  }, [isOpen, state]);

  // Remove from minimized when closed
  useEffect(() => {
    if (!isOpen) {
      removeWindow("terminal");
    }
  }, [isOpen, removeWindow]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Sync state from parent (for external control like clicking code snippet)
  useEffect(() => {
    if (isOpen && terminalState) {
      // Only sync specific transitions requested by parent
      const parentWantsNormal = terminalState === "normal";
      const currentlyMinimized = state === "minimized";

      if (parentWantsNormal && currentlyMinimized) {
        // Parent wants to restore from minimized (e.g., code snippet clicked)
        setState("normal");
        removeWindow("terminal");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalState, isOpen]);

  // Remove from minimized when restored or maximized
  useEffect(() => {
    if (state !== "minimized" && state !== "normal") {
      // Only remove when maximizing, not when going to normal from minimized
      removeWindow("terminal");
    }
  }, [state, removeWindow]);

  // Snake Game State
  const [isGameMode, setIsGameMode] = useState(false);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const GRID_SIZE = 20;
  const CELL_SIZE = 15;

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsGameMode(true);
    setTimeout(() => gameContainerRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!isGameMode || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: (prevSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
          y: (prevSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
        };

        // Check collision with self
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check collision with food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(moveSnake);
  }, [isGameMode, gameOver, direction, food]);

  const handleGameKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case "ArrowDown":
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case "ArrowLeft":
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case "ArrowRight":
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case "Escape":
        setIsGameMode(false);
        break;
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output = "";

    if (!portfolio) {
      setHistory([...history, { command: cmd, output: "Loading data... please try again." }]);
      setInput("");
      return;
    }

    switch (trimmedCmd) {
      case "help":
        output =
          "Available commands:\n" +
          "  help     - Show this help message\n" +
          "  about    - Learn more about me\n" +
          "  skills   - View my technical skills\n" +
          "  projects - See my recent projects\n" +
          "  contact  - Get my contact information\n" +
          "  snake    - Play Snake game 🐍\n" +
          "  clear    - Clear the terminal";
        break;
      case "snake":
        startGame();
        return; // Don't add to history immediately
      case "about":
        output = portfolio.about.bio.join(" ");
        break;
      case "skills":
        output = `• Frontend: ${portfolio.skills.frontend.join(", ")}\n• Backend: ${portfolio.skills.backend.join(", ")}\n• Tools: ${portfolio.skills.tools.join(", ")}`;
        break;
      case "contact":
        output = `Email: ${portfolio.personal.email} | Phone: ${portfolio.personal.phone}`;
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      default:
        output = `Command not found: ${trimmedCmd}. Type 'help' for available commands.`;
    }

    setHistory([...history, { command: cmd, output }]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
  };

  const handleClose = () => {
    removeWindow("terminal"); // Ensure it's removed from minimized list when closed
    onClose();
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isOpen) return null;

  const getWindowClasses = () => {
    if (isMobile && state !== "minimized") {
      return "fixed inset-0 z-50 m-0 rounded-none";
    }

    switch (state) {
      case "maximized":
        return "fixed inset-0 z-50";
      case "minimized":
        return "fixed w-[90vw] md:w-[500px]";
      case "normal":
        return "fixed bottom-20 left-4 right-4 h-[60vh] md:left-auto md:bottom-4 md:right-28 md:w-[500px] md:max-w-[90vw] md:h-[600px] md:max-h-[80vh]";
      default:
        return "fixed bottom-20 left-4 right-4 h-[60vh] md:left-auto md:bottom-4 md:right-28 md:w-[500px] md:max-w-[90vw] md:h-[600px] md:max-h-[80vh]";
    }
  };

  const getWindowStyle = () => {
    if (isMobile && state !== "minimized") {
      return { width: "100%", height: "100%" };
    }
    if (state === "minimized") {
      return getPosition("terminal");
    }
    return {};
  };

  return (
    <AnimatePresence>
      <motion.div
        drag={state === "normal" && !isMobile}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          top: 0,
          left: 0,
          right: typeof window !== "undefined" ? window.innerWidth : 0,
          bottom: typeof window !== "undefined" ? window.innerHeight : 0,
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`${getWindowClasses()} z-40 flex flex-col`}
        style={getWindowStyle()}
      >
        <div className="theme-terminal-bg backdrop-blur-md border-2 border-[var(--accent-primary)]/50 rounded-xl shadow-2xl shadow-[var(--accent-primary)]/20 overflow-hidden font-mono text-sm flex flex-col h-full">
          {/* Header with controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10">
            <span className="theme-text flex items-center gap-2 font-semibold">
              <TerminalIcon className="w-4 h-4 animate-pulse" />
              <span className="text-xs tracking-wider">TERMINAL@PORTFOLIO:~$</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-1.5 hover:bg-[var(--accent-primary)]/20 rounded-full transition-colors group cursor-pointer"
                title={state === "minimized" ? "Restore" : "Minimize"}
              >
                <Minus className="w-4 h-4 text-[var(--accent-primary)]" />
              </button>
              <button
                onClick={handleMaximize}
                className="p-1.5 hover:bg-[var(--accent-primary)]/20 rounded-full transition-colors group cursor-pointer"
                title={state === "maximized" ? "Restore" : "Maximize"}
              >
                {state === "maximized" ? (
                  <Square className="w-4 h-4 text-[var(--accent-primary)]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors group cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Terminal content */}
          {state !== "minimized" && !isGameMode && (
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-2 text-[var(--accent-primary)] scrollbar-thin scrollbar-thumb-[var(--accent-primary)]/30 scrollbar-track-transparent"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="theme-text font-bold">❯</span>
                    <span className="text-blue-400">~</span>
                    <span className="theme-text font-semibold opacity-90">{item.command}</span>
                  </div>
                  <div className="pl-6 theme-text/80 whitespace-pre-wrap leading-relaxed">
                    {item.output}
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                <span className="theme-text font-bold">❯</span>
                <span className="text-blue-400">~</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none theme-text placeholder-theme-text/50 font-medium caret-theme-text"
                  placeholder="Type a command..."
                  autoFocus
                />
              </form>
            </div>
          )}

          {/* Snake Game Canvas */}
          {isGameMode && (
            <div
              className="flex-1 relative bg-black/90 flex flex-col items-center justify-center p-4 outline-none"
              tabIndex={0}
              onKeyDown={handleGameKeyDown}
              ref={gameContainerRef}
            >
              <div className="absolute top-2 right-4 text-green-500 font-mono">Score: {score}</div>
              <div className="absolute top-2 left-4 text-green-500 font-mono text-xs">
                Press ESC to exit
              </div>

              {gameOver ? (
                <div className="text-center space-y-4">
                  <h3 className="text-red-500 text-2xl font-bold animate-pulse">GAME OVER</h3>
                  <p className="text-green-400">Final Score: {score}</p>
                  <button
                    onClick={startGame}
                    className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500/20 rounded transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div
                  className="relative border border-green-500/30 bg-black"
                  style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                  }}
                >
                  {snake.map((segment, i) => (
                    <div
                      key={i}
                      className="absolute bg-green-500"
                      style={{
                        left: segment.x * CELL_SIZE,
                        top: segment.y * CELL_SIZE,
                        width: CELL_SIZE - 1,
                        height: CELL_SIZE - 1,
                        opacity: i === 0 ? 1 : 0.7,
                      }}
                    />
                  ))}
                  <div
                    className="absolute bg-red-500 rounded-full animate-pulse"
                    style={{
                      left: food.x * CELL_SIZE,
                      top: food.y * CELL_SIZE,
                      width: CELL_SIZE - 1,
                      height: CELL_SIZE - 1,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sidebar icon component
export function TerminalIconButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-4 bottom-4 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      title="Open Terminal"
    >
      <TerminalIcon className="w-6 h-6 text-white" />
    </motion.button>
  );
}

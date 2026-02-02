"use client";

import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { useMinimizedWindows } from "@/context/MinimizedWindowsContext";
import { useAnalytics } from "@/context/AnalyticsContext";

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  windowId: string;
}

export default function DraggableModal({
  isOpen,
  onClose,
  title,
  children,
  defaultWidth = 600,
  defaultHeight = 500,
  minWidth = 400,
  minHeight = 300,
  windowId,
}: DraggableModalProps) {
  const [state, setState] = useState<"normal" | "minimized" | "maximized">("normal");
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const { addWindow, removeWindow, getPosition } = useMinimizedWindows();
  const { trackAction } = useAnalytics();

  const handleCloseInternal = () => {
    trackAction("click", "modal-close", { modalId: windowId, title });
    onClose();
  };

  const handleMinimize = () => {
    if (state === "minimized") {
      setState("normal");
      trackAction("click", "modal-restore", { modalId: windowId, title, from: "minimized" });
      removeWindow(windowId);
    } else {
      setState("minimized");
      trackAction("click", "modal-minimize", { modalId: windowId, title });
      addWindow({
        id: windowId,
        title,
        onRestore: () => setState("normal"),
      });
    }
  };

  const handleMaximize = () => {
    const newState = state === "maximized" ? "normal" : "maximized";
    setState(newState);
    trackAction("click", newState === "maximized" ? "modal-maximize" : "modal-restore", {
      modalId: windowId,
      title,
      from: state,
    });
  };

  // Remove from minimized windows when component unmounts or is closed
  useEffect(() => {
    return () => {
      removeWindow(windowId);
    };
  }, [windowId, removeWindow]);

  // Remove from minimized when restored or maximized
  useEffect(() => {
    if (state !== "minimized") {
      removeWindow(windowId);
    }
  }, [state, windowId, removeWindow]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getWindowClasses = () => {
    if (isMobile && state !== "minimized") {
      return "fixed inset-0 z-50 m-0 rounded-none";
    }

    switch (state) {
      case "minimized":
        return "fixed w-[500px]";
      case "maximized":
        return "fixed inset-4 top-20";
      default:
        return "fixed top-20 left-1/2 -translate-x-1/2";
    }
  };

  const getWindowStyle = () => {
    if (isMobile && state !== "minimized") {
      return { width: "100%", height: "100%" };
    }
    if (state === "minimized") {
      const position = getPosition(windowId);
      return position;
    }
    if (state === "normal") {
      return {
        width: size.width,
        height: size.height,
        maxWidth: "95vw",
        maxHeight: "90vh",
      };
    }
    return {};
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only show when NOT minimized */}
      {state !== "minimized" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseInternal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        />
      )}

      {/* Draggable Modal */}
      <motion.div
        drag={state === "normal" && !isMobile}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          top: 80,
          left: -window.innerWidth / 2 + 200,
          right: window.innerWidth / 2 - 200,
          bottom: window.innerHeight - 200,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${getWindowClasses()} z-50`}
        style={getWindowStyle()}
      >
        <div className="theme-terminal-bg border theme-border rounded-xl theme-shadow overflow-hidden flex flex-col h-full">
          {/* Header with controls */}
          <div className="flex items-center justify-between px-4 py-3 theme-card border-b theme-border cursor-move">
            <span className="theme-text font-medium">{title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-1.5 hover:bg-yellow-500/20 rounded-full transition-colors group cursor-pointer"
                title={state === "minimized" ? "Restore" : "Minimize"}
              >
                <Minus className="w-4 h-4 text-yellow-500" />
              </button>
              <button
                onClick={handleMaximize}
                className="p-1.5 hover:bg-green-500/20 rounded-full transition-colors group cursor-pointer"
                title={state === "maximized" ? "Restore" : "Maximize"}
              >
                {state === "maximized" ? (
                  <Square className="w-4 h-4 text-green-500" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-green-500" />
                )}
              </button>
              <button
                onClick={handleCloseInternal}
                className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors group cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          {state !== "minimized" && <div className="flex-1 overflow-auto">{children}</div>}
        </div>

        {/* Resize handle */}
        {state === "normal" && !isMobile && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = size.width;
              const startHeight = size.height;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.max(minWidth, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(minHeight, startHeight + (moveEvent.clientY - startY));
                setSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 theme-border opacity-50" />
          </div>
        )}
      </motion.div>
    </>
  );
}

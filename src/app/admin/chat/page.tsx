"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  User,
  Bot,
  Calendar,
  Clock,
  Loader2,
  RefreshCcw,
  ChevronRight,
  MessageSquare,
  Settings,
  KeySquare,
  Activity,
  Save,
} from "lucide-react";

// Raw message from API
interface RawMessage {
  _id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: string;
}

// Display message format
interface DisplayMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

interface ChatSession {
  _id: string; // userId
  userName?: string | null; // User name from VisitorStats
  lastMessage: RawMessage;
  messageCount: number;
  messages: RawMessage[];
}

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [activeTab, setActiveTab] = useState("history");
  const [settings, setSettings] = useState({
    systemPrompt: "",
    customKnowledge: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setTimeout(() => setRefreshing(false), 500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession]);

  useEffect(() => {
    fetchSessions();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/ai/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching AI settings:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving AI settings:", error);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten raw messages into display messages
  const getDisplayMessages = (rawMessages: RawMessage[]): DisplayMessage[] => {
    const displayMessages: DisplayMessage[] = [];

    // Sort by timestamp first
    const sorted = [...rawMessages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sorted.forEach((msg) => {
      // Add user message
      displayMessages.push({
        id: `${msg._id}-user`,
        role: "user",
        content: msg.message,
        timestamp: msg.timestamp,
      });

      // Add bot response
      // We add a small offset to timestamp to ensure it appears after user message
      const responseTime = new Date(msg.timestamp).getTime() + 1000;
      displayMessages.push({
        id: `${msg._id}-bot`,
        role: "bot",
        content: msg.response,
        timestamp: new Date(responseTime).toISOString(),
      });
    });

    return displayMessages;
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session._id.toLowerCase().includes(search.toLowerCase()) ||
      session.messages.some(
        (m) =>
          m.message.toLowerCase().includes(search.toLowerCase()) ||
          m.response.toLowerCase().includes(search.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            AI & Chat History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage AI settings and review past conversations
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <History className="w-4 h-4" />
              Chat History
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Settings className="w-4 h-4" />
              AI Settings
            </button>
          </div>

          {activeTab === "history" && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50 self-end sm:self-auto"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {activeTab === "history" ? (
          <>
            {/* Sessions List */}
            <div
              className={`w-full lg:w-1/3 flex flex-col bg-gray-800 rounded-xl border border-gray-700 ${selectedSession ? "hidden lg:flex" : "flex"}`}
            >
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users or messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredSessions.map((session) => (
                  <button
                    key={session._id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                      selectedSession?._id === session._id
                        ? "bg-blue-600/20 border border-blue-500/30"
                        : "hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm truncate">
                          {session.userName || session._id.replace("user_", "User ")}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.lastMessage.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {session.lastMessage.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                          {session.messageCount} msgs
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 mt-1 ${selectedSession?._id === session._id ? "text-blue-400" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat View */}
            <div
              className={`w-full lg:w-2/3 bg-gray-800 rounded-xl border border-gray-700 flex flex-col ${!selectedSession ? "hidden lg:flex" : "flex"}`}
            >
              {selectedSession ? (
                <>
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedSession(null)}
                        className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      <div>
                        <h3 className="font-bold text-white">
                          {selectedSession.userName ||
                            selectedSession._id.replace("user_", "User ")}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Last active:{" "}
                          {new Date(selectedSession.lastMessage.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">ID: {selectedSession._id}</div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
                    {getDisplayMessages(selectedSession.messages).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-blue-400" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-500"}`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>

                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a conversation to view history</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 overflow-y-auto pb-8 pr-4"
          >
            {isSettingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Main Toggle Card */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Assistant Status</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      When disabled, the chatbot will fall back to basic keyword matching instead of
                      using Gemini.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.isActive}
                      onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* System Prompt Card */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <KeySquare className="w-5 h-5 text-purple-400" />
                      <h2 className="text-xl font-bold text-white">
                        Custom Personality / Instructions
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Override the AI&apos;s default behavior. Tell it how to act, what tone to use,
                      or how to address the user. These instructions are injected heavily into the
                      system prompt.
                    </p>
                    <textarea
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      placeholder="e.g. You are a highly professional assistant for Narayan. Always greet the user warmly and use emojis sparingly. Speak confidently about Narayan's skills in Next.js and MongoDB."
                      className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none flex-1"
                    />
                  </div>

                  {/* Custom Knowledge Card */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-green-400" />
                      <h2 className="text-xl font-bold text-white">Admin Knowledge Base</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Provide temporary context, new facts, or secret information that isn&apos;t on
                      your public portfolio, so the AI can answer related questions without needing
                      to edit your resume payload.
                    </p>
                    <textarea
                      value={settings.customKnowledge}
                      onChange={(e) =>
                        setSettings({ ...settings, customKnowledge: e.target.value })
                      }
                      placeholder="e.g. Narayan is currently taking on freelance clients for 2026. His minimum project rate is $500. He just bought a new puppy named Max."
                      className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? "Saving..." : "Save AI Configuration"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

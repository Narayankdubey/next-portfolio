"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Bot, KeySquare, Activity, MessageSquare } from "lucide-react";

export default function AICommandCenter() {
  const [activeTab, setActiveTab] = useState("settings");
  const [settings, setSettings] = useState({
    systemPrompt: "",
    customKnowledge: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    totalMessages: 0,
    uniqueUsers: 0,
    recentMessages: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

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
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/ai/analytics");
      const data = await res.json();
      if (data.analytics) setAnalytics(data.analytics);
      if (data.logs) setLogs(data.logs);
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            AI Command Center
          </h1>
          <p className="text-gray-400 mt-1">Manage and train your portfolio AI assistant.</p>
        </div>
        <div className="flex bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === "settings"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Analytics & Logs
          </button>
        </div>
      </div>

      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Toggle Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">AI Assistant Status</h2>
              <p className="text-gray-400 text-sm mt-1">
                When disabled, the chatbot will fall back to basic keyword matching instead of using
                Gemini.
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
                <h2 className="text-xl font-bold text-white">Custom Personality / Instructions</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Override the AI&apos;s default behavior. Tell it how to act, what tone to use, or
                how to address the user. These instructions are injected heavily into the system
                prompt.
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
                Provide temporary context, new facts, or secret information that isn&apos;t on your
                public portfolio, so the AI can answer related questions without needing to edit
                your resume payload.
              </p>
              <textarea
                value={settings.customKnowledge}
                onChange={(e) => setSettings({ ...settings, customKnowledge: e.target.value })}
                placeholder="e.g. Narayan is currently taking on freelance clients for 2026. His minimum project rate is $500. He just bought a new puppy named Max."
                className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700">
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
        </motion.div>
      )}

      {activeTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="text-3xl font-bold text-white">{analytics.totalMessages}</h3>
              <p className="text-gray-400 text-sm">Total AI Responses</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center">
              <Bot className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-3xl font-bold text-white">{analytics.uniqueUsers}</h3>
              <p className="text-gray-400 text-sm">Unique Users Chatting</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center">
              <Activity className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-3xl font-bold text-white">{analytics.recentMessages}</h3>
              <p className="text-gray-400 text-sm">Messages in Last 7 Days</p>
            </div>
          </div>

          {/* Chat Logs Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Recent AI Conversations</h2>
              <p className="text-gray-400 text-sm mt-1">Review the last 50 interactions.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/50 text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">User Message</th>
                    <th className="px-6 py-4 font-medium">AI Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-750/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                        <td className="px-6 py-4 max-w-md truncate" title={log.response}>
                          {log.response}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No chat logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Loader2,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function PortfolioEditor() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      const json = await res.json();
      // If data is null, default to an empty object template or just {}
      setCode(JSON.stringify(json.data || {}, null, 2));
      setStatus(null);
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      setStatus({ type: "error", message: "Failed to load portfolio data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      // Validate JSON first
      const parsedData = JSON.parse(code);

      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStatus({ type: "success", message: "Portfolio updated successfully!" });
      // Re-format the code on save to look pretty
      setCode(JSON.stringify(parsedData, null, 2));
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error instanceof SyntaxError ? "Invalid JSON format" : "Failed to save changes",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Portfolio Editor
          </h1>
          <p className="text-gray-400 text-sm mt-1">Edit your portfolio content directly (JSON)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg border flex items-center gap-3 ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {status.message}
        </motion.div>
      )}

      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setStatus(null);
          }}
          className="w-full h-[calc(100vh-16rem)] bg-gray-900 text-gray-300 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          spellCheck="false"
        />
      </div>
    </div>
  );
}

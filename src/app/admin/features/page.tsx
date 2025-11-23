"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Settings,
  Code,
  FormInput,
} from "lucide-react";

interface FeatureFlags {
  features: Record<string, boolean>;
  sections: Record<string, boolean>;
  userCustomizable: {
    features: string[];
    sections: string[];
  };
  devMode?: {
    showFeatureToggles: boolean;
    enableDebugLogs: boolean;
  };
}

export default function FeatureFlagsEditor() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editMode, setEditMode] = useState<"ui" | "json">("ui");
  const [jsonCode, setJsonCode] = useState("");

  // New feature state
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureType, setNewFeatureType] = useState<"features" | "sections">("features");

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/features");
      const data = await res.json();
      if (data.data) {
        // Ensure userCustomizable exists
        const flagsData = data.data;
        if (!flagsData.userCustomizable) {
          flagsData.userCustomizable = { features: [], sections: [] };
        }
        setFlags(flagsData);
        setJsonCode(JSON.stringify(flagsData, null, 2));
      }
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFlags();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      let dataToSave = flags;

      // If in JSON mode, parse and validate JSON first
      if (editMode === "json") {
        try {
          dataToSave = JSON.parse(jsonCode);
          setFlags(dataToSave); // Update UI state with parsed JSON
        } catch (e) {
          throw new Error("Invalid JSON format");
        }
      } else {
        // Sync JSON code with current flags
        setJsonCode(JSON.stringify(flags, null, 2));
      }

      const res = await fetch("/api/admin/features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      setStatus({ type: "success", message: "Feature flags updated successfully!" });
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (category: "features" | "sections", key: string) => {
    if (!flags) return;
    setFlags({
      ...flags,
      [category]: {
        ...flags[category],
        [key]: !flags[category][key],
      },
    });
  };

  const toggleCustomizable = (category: "features" | "sections", key: string) => {
    if (!flags) return;
    const currentList = flags.userCustomizable[category] || [];
    const isCustomizable = currentList.includes(key);

    let newList;
    if (isCustomizable) {
      newList = currentList.filter((k) => k !== key);
    } else {
      newList = [...currentList, key];
    }

    setFlags({
      ...flags,
      userCustomizable: {
        ...flags.userCustomizable,
        [category]: newList,
      },
    });
  };

  const handleAddFeature = () => {
    if (!flags || !newFeatureName.trim()) return;

    // Convert to camelCase for key
    const key = newFeatureName
      .trim()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, "");

    if (flags[newFeatureType][key] !== undefined) {
      setStatus({ type: "error", message: "Feature with this name already exists" });
      return;
    }

    setFlags({
      ...flags,
      [newFeatureType]: {
        ...flags[newFeatureType],
        [key]: false, // Default to disabled
      },
    });

    setNewFeatureName("");
    setStatus({ type: "success", message: `Added new ${newFeatureType.slice(0, -1)}: ${key}` });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDeleteFeature = (category: "features" | "sections", key: string) => {
    if (!flags || !confirm(`Are you sure you want to delete "${key}"?`)) return;

    const newCategoryObj = { ...flags[category] };
    delete newCategoryObj[key];

    // Also remove from userCustomizable if present
    const newUserCustomizable = { ...flags.userCustomizable };
    newUserCustomizable[category] = newUserCustomizable[category].filter((k) => k !== key);

    setFlags({
      ...flags,
      [category]: newCategoryObj,
      userCustomizable: newUserCustomizable,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!flags) return null;

  const renderSection = (
    title: string,
    icon: any,
    category: "features" | "sections",
    color: string
  ) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">
        {Object.entries(flags[category]).map(([key, value]) => {
          const isCustomizable = flags.userCustomizable?.[category]?.includes(key);

          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-200 block capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  {isCustomizable && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                      Customizable
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  flags.{category}.{key}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCustomizable(category, key)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isCustomizable
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                  title="Toggle User Customizable"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleFeature(category, key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? `bg-${color}-600` : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleDeleteFeature(category, key)}
                  className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Feature"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {Object.keys(flags[category]).length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">No flags defined</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ToggleLeft className="w-6 h-6 text-blue-500" />
            Feature Flags
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage application features and availability</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setEditMode("ui")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editMode === "ui"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FormInput className="w-4 h-4" />
              UI
            </button>
            <button
              onClick={() => {
                setEditMode("json");
                // Sync JSON code with current flags when switching to JSON mode
                if (flags) setJsonCode(JSON.stringify(flags, null, 2));
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editMode === "json"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              JSON
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
      </AnimatePresence>

      {editMode === "ui" ? (
        <>
          {/* Add New Feature */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-400 mb-1">New Feature Name</label>
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="e.g. Dark Mode, Beta Feature"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={newFeatureType}
                onChange={(e) => setNewFeatureType(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="features">Global Feature</option>
                <option value="sections">Page Section</option>
              </select>
            </div>
            <button
              onClick={handleAddFeature}
              disabled={!newFeatureName.trim()}
              className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pb-8">
            {renderSection(
              "Global Features",
              <ToggleLeft className="w-5 h-5 text-purple-500" />,
              "features",
              "blue"
            )}
            {renderSection(
              "Page Sections",
              <ToggleRight className="w-5 h-5 text-green-500" />,
              "sections",
              "green"
            )}
          </div>
        </>
      ) : (
        /* JSON Editor Mode */
        <div className="flex-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-3">
            <h3 className="text-sm font-medium text-gray-300 mb-1">JSON Editor</h3>
            <p className="text-xs text-gray-500">
              Edit the feature flags data in JSON format. Make sure the JSON is valid before saving.
            </p>
          </div>
          <textarea
            value={jsonCode}
            onChange={(e) => {
              setJsonCode(e.target.value);
              setStatus(null);
            }}
            className="w-full h-[calc(100vh-20rem)] bg-gray-900 text-gray-300 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}

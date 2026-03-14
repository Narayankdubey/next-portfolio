"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  MousePointerClick,
  BarChart2,
  GitMerge,
  Loader2,
  RefreshCcw,
  Users,
  ChevronDown,
} from "lucide-react";

interface ClickPoint {
  x: number;
  y: number;
  count: number;
}

interface ScrollSection {
  section: string;
  avgScrollDepth: number;
  avgDuration: number;
  avgInteractions: number;
  visitorCount: number;
}

interface FunnelSection {
  section: string;
  uniqueVisitors: number;
  pct: number;
}

interface HeatmapData {
  clicks: ClickPoint[];
  scrollData: ScrollSection[];
  funnelData: FunnelSection[];
  totalVisitors: number;
  pages: string[];
}

const SECTION_COLORS: Record<string, string> = {
  hero: "#3b82f6",
  about: "#8b5cf6",
  skills: "#06b6d4",
  projects: "#10b981",
  experience: "#f59e0b",
  testimonials: "#ec4899",
  contact: "#ef4444",
  blog: "#6366f1",
  "blog-listing": "#6366f1",
  "blog-detail": "#a855f7",
};

function getSectionColor(section: string) {
  return SECTION_COLORS[section] || "#6b7280";
}

function formatDuration(ms: number) {
  if (!ms) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function HeatmapPage() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPage, setSelectedPage] = useState("/");
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"clicks" | "scroll" | "funnel">("clicks");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/analytics/heatmap?page=${encodeURIComponent(selectedPage)}&days=${days}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Heatmap fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPage, days]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const maxCount = data?.clicks.reduce((m, c) => Math.max(m, c.count), 1) ?? 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            Heatmaps & Advanced Analytics
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Visualize where visitors click, how deep they scroll, and which sections they visit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Page Selector */}
          <div className="relative">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {(data?.pages ?? ["/"]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Days Selector */}
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Visitors",
              value: data.totalVisitors,
              icon: Users,
              color: "text-blue-400",
            },
            {
              label: "Click Points Tracked",
              value: data.clicks.reduce((s, c) => s + c.count, 0),
              icon: MousePointerClick,
              color: "text-orange-400",
            },
            {
              label: "Sections Tracked",
              value: data.scrollData.length,
              icon: BarChart2,
              color: "text-purple-400",
            },
            {
              label: "Funnel Steps",
              value: data.funnelData.length,
              icon: GitMerge,
              color: "text-emerald-400",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
              </div>
              <stat.icon className={`w-7 h-7 ${stat.color} opacity-80`} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-gray-800 p-1 rounded-lg w-fit">
        {(
          [
            { id: "clicks", label: "Click Heatmap", icon: MousePointerClick },
            { id: "scroll", label: "Scroll Depth", icon: BarChart2 },
            { id: "funnel", label: "Section Funnel", icon: GitMerge },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* ===== CLICK HEATMAP ===== */}
          {activeTab === "clicks" && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Click Heatmap — {selectedPage}</h2>
                <p className="text-sm text-gray-400">
                  Each dot represents a click location. Larger & redder = more clicks.
                </p>
              </div>
              <div className="relative bg-gray-900/70" style={{ height: "500px" }}>
                {data?.clicks.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <MousePointerClick className="w-12 h-12 mb-2 opacity-30" />
                    <p>No click data yet for this page.</p>
                    <p className="text-xs mt-1">
                      Visit the page and click around to generate data.
                    </p>
                  </div>
                ) : (
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <radialGradient id="hotspot">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {data?.clicks.map((pt, i) => {
                      const intensity = pt.count / maxCount;
                      const r = 8 + intensity * 28;
                      const opacity = 0.3 + intensity * 0.65;
                      const color =
                        intensity > 0.75
                          ? "#ef4444"
                          : intensity > 0.5
                            ? "#f97316"
                            : intensity > 0.25
                              ? "#eab308"
                              : "#3b82f6";
                      return (
                        <g key={i}>
                          <circle
                            cx={`${pt.x}%`}
                            cy={`${pt.y}%`}
                            r={r}
                            fill={color}
                            opacity={opacity * 0.4}
                          />
                          <circle
                            cx={`${pt.x}%`}
                            cy={`${pt.y}%`}
                            r={r / 2.5}
                            fill={color}
                            opacity={opacity}
                          />
                          <title>
                            ({pt.x}%, {pt.y}%) — {pt.count} clicks
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                )}
                {/* Coordinate grid guide */}
                <div className="absolute bottom-2 right-3 text-xs text-gray-600">
                  x: left→right | y: top→bottom (as % of page)
                </div>
              </div>
              {/* Legend */}
              <div className="p-4 flex items-center gap-2 text-xs text-gray-400">
                <span>Low</span>
                {["#3b82f6", "#eab308", "#f97316", "#ef4444"].map((c) => (
                  <span
                    key={c}
                    className="w-6 h-3 rounded-sm inline-block"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span>High</span>
              </div>
            </div>
          )}

          {/* ===== SCROLL DEPTH ===== */}
          {activeTab === "scroll" && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Scroll Depth per Section</h2>
                <p className="text-sm text-gray-400">
                  Average scroll depth, time spent, and interactions per portfolio section.
                </p>
              </div>
              <div className="p-6 space-y-4">
                {data?.scrollData.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-gray-500">
                    <BarChart2 className="w-12 h-12 mb-2 opacity-30" />
                    <p>No scroll data available yet.</p>
                  </div>
                ) : (
                  data?.scrollData.map((s) => (
                    <div key={s.section} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className="font-medium capitalize"
                          style={{ color: getSectionColor(s.section) }}
                        >
                          {s.section.replace("-", " ")}
                        </span>
                        <div className="flex items-center gap-4 text-gray-400 text-xs">
                          <span title="Visitors">{s.visitorCount} visitors</span>
                          <span title="Avg time spent">{formatDuration(s.avgDuration)}</span>
                          <span className="font-semibold text-white">{s.avgScrollDepth}%</span>
                        </div>
                      </div>
                      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ backgroundColor: getSectionColor(s.section) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.avgScrollDepth}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                        {/* 50% midline */}
                        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-500/50" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== FUNNEL ===== */}
          {activeTab === "funnel" && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Section Visit Funnel</h2>
                <p className="text-sm text-gray-400">
                  Percentage of total visitors who viewed each section — ordered by typical journey.
                </p>
              </div>
              <div className="p-6 space-y-3">
                {data?.funnelData.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-gray-500">
                    <GitMerge className="w-12 h-12 mb-2 opacity-30" />
                    <p>No funnel data available yet.</p>
                  </div>
                ) : (
                  data?.funnelData.map((f, i) => (
                    <div key={f.section} className="flex items-center gap-3">
                      {/* Step number */}
                      <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span
                            className="font-medium capitalize"
                            style={{ color: getSectionColor(f.section) }}
                          >
                            {f.section.replace("-", " ")}
                          </span>
                          <span className="text-gray-300 font-semibold">
                            {f.uniqueVisitors}{" "}
                            <span className="text-gray-500 font-normal">({f.pct}%)</span>
                          </span>
                        </div>
                        <div className="relative h-5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full flex items-center"
                            style={{ backgroundColor: getSectionColor(f.section) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(f.pct, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

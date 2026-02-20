"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  Eye,
  TrendingUp,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCcw,
  MousePointerClick,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { generatePDF } from "@/lib/pdfUtils";

interface Journey {
  _id: string;
  sessionId: string;
  visitorId: string;
  landingPage: string;
  referrer: string;
  device: {
    type: string;
    os: string;
    browser: string;
    deviceName?: string;
  };
  location?: {
    city?: string;
    country?: string;
    region?: string;
    ip?: string;
  };
  startTime: string;
  updatedAt: string;
  totalSessions: number;
  endTime?: string;
  totalDuration?: number;
  events: Array<{
    sectionId: string;
    viewedAt: string;
    duration: number;
    scrollDepth: number;
  }>;
}

export default function AnalyticsPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [filter, setFilter] = useState("week");
  const [search, setSearch] = useState("");
  const [interaction, setInteraction] = useState("");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deviceType, setDeviceType] = useState("all");
  const [os, setOs] = useState("all");
  const [browser, setBrowser] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    fetchJourneys();
  }, [filter, page, search, deviceType, os, browser, interaction, sortField, sortOrder]);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(filter && { filter }),
        ...(search && { search }),
        ...(deviceType !== "all" && { deviceType }),
        ...(os !== "all" && { os }),
        ...(browser !== "all" && { browser }),
        ...(interaction && { interaction }),
        sortField,
        sortOrder,
      });

      const response = await fetch(`/api/admin/analytics/journeys?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setJourneys(data.journeys);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching journeys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = new URLSearchParams({
        ...(filter && { filter }),
        ...(search && { search }),
        ...(deviceType !== "all" && { deviceType }),
        ...(os !== "all" && { os }),
        ...(browser !== "all" && { browser }),
        ...(interaction && { interaction }),
        sortField,
        sortOrder,
      });

      const response = await fetch(`/api/admin/analytics/export?${params}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export CSV error:", error);
      alert("Failed to export CSV");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await generatePDF(
        "analytics-container",
        `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Failed to export PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return "N/A";
    if (ms < 1000) return "< 1s";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJourneys();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-8" id="analytics-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Journey Analytics</h1>
            <p className="text-gray-400">Track visitor behavior and section impressions</p>
          </div>
          <div className="flex gap-2" data-html2canvas-ignore>
            <div className="relative" data-html2canvas-ignore>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportingCsv || exportingPdf || loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
              >
                <Download
                  className={`w-4 h-4 ${exportingCsv || exportingPdf ? "animate-bounce" : ""}`}
                />
                {exportingCsv || exportingPdf ? "Exporting..." : "Export"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showExportMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleExportCsv}
                    className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
                  >
                    <span className="font-medium">Export CSV</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors border-t border-gray-700"
                  >
                    <span className="font-medium">Export PDF</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Visitors</p>
                <p className="text-2xl font-bold text-white">{pagination.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Total Duration</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(stats.totalDuration)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters Panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Time Filter */}
            <div className="flex bg-gray-900/50 p-1 rounded-lg">
              {["today", "week", "month", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f === "all" ? "" : f);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === (f === "all" ? "" : f)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Search Inputs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search ID, Page..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900/50 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm placeholder-gray-500 outline-none"
                />
              </div>
              <div className="relative flex-1">
                <MousePointerClick className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Target interaction..."
                  value={interaction}
                  onChange={(e) => {
                    setInteraction(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900/50 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm placeholder-gray-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="pt-4 border-t border-gray-700/50 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-gray-400 mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Refine:</span>
            </div>

            {[
              {
                value: deviceType,
                set: setDeviceType,
                options: ["all", "desktop", "mobile", "tablet"],
                label: "Device",
              },
              {
                value: os,
                set: setOs,
                options: ["all", "Mac", "Windows", "Android", "iOS", "Linux"],
                label: "OS",
              },
              {
                value: browser,
                set: setBrowser,
                options: ["all", "Chrome", "Firefox", "Safari", "Edge", "Opera"],
                label: "Browser",
              },
            ].map((dropdown, idx) => (
              <div key={idx} className="relative">
                <select
                  value={dropdown.value}
                  onChange={(e) => {
                    dropdown.set(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 bg-gray-900/50 text-gray-300 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer outline-none hover:bg-gray-800 transition-colors"
                >
                  <option value="all">{dropdown.label}: All</option>
                  {dropdown.options
                    .filter((o) => o !== "all")
                    .map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 rotate-90 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Journeys Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Landing Page
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white group"
                    onClick={() => {
                      if (sortField === "device.type") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("device.type");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Device
                      {sortField === "device.type" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white group"
                    onClick={() => {
                      if (sortField === "totalSessions") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("totalSessions");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Total Sessions
                      {sortField === "totalSessions" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white group"
                    onClick={() => {
                      if (sortField === "totalDuration") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("totalDuration");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Duration
                      {sortField === "totalDuration" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white group"
                    onClick={() => {
                      if (sortField === "updatedAt") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("updatedAt");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Last Active
                      {sortField === "updatedAt" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : journeys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No journeys found
                    </td>
                  </tr>
                ) : (
                  journeys.map((journey) => (
                    <tr
                      key={journey._id}
                      className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/analytics/${journey.visitorId || journey.sessionId}`}
                          className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                        >
                          {(journey.sessionId || journey.visitorId || "").substring(0, 12)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 max-w-[150px] sm:max-w-[200px]">
                        <div
                          className="text-gray-200 text-sm truncate cursor-help"
                          title={journey.landingPage}
                        >
                          {journey.landingPage}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-200 capitalize flex flex-col gap-1">
                            <span>{journey.device.deviceName || journey.device.type}</span>
                          </div>
                          <div className="text-gray-400 text-xs">
                            {journey.device.os} / {journey.device.browser}
                          </div>
                          {journey.location &&
                            (journey.location.city ||
                              journey.location.country ||
                              journey.location.ip) && (
                              <div
                                className="text-gray-500 text-xs mt-1 flex items-center gap-1 truncate"
                                title={journey.location.ip}
                              >
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {journey.location.city || journey.location.country
                                    ? `${journey.location.city || "Unknown"}${journey.location.country ? `, ${journey.location.country}` : ""}`
                                    : `IP: ${journey.location.ip}`}
                                </span>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-200 text-sm">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                          {journey.totalSessions} Sessions
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-200 text-sm">
                        {formatDuration(journey.totalDuration)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(journey.updatedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
              <div className="text-gray-400 text-sm">
                Page {page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1 rounded bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

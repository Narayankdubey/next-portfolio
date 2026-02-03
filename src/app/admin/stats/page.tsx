"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Loader2,
  Users,
  Globe,
  Monitor,
  Smartphone,
  RefreshCcw,
  Activity,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";

interface Journey {
  _id: string;
  visitorId: string;
  latestSessionId: string;
  totalSessions: number;
  firstSeen: string;
  lastActive: string; // was startTime
  landingPage: string;
  totalDuration: number;
  device: {
    type: string;
    os: string;
    browser: string;
  };
}

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "journeys">("stats");

  // Stats State
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);

  // Journeys State
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(true);
  const [filter, setFilter] = useState("week");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  useEffect(() => {
    fetchStats();
    fetchJourneys();
  }, []);

  useEffect(() => {
    if (activeTab === "journeys") {
      fetchJourneys();
    }
  }, [filter, page, search, activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      setStatsData(json);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefreshStats = async () => {
    setRefreshingStats(true);
    await fetchStats();
    setTimeout(() => setRefreshingStats(false), 500);
  };

  const fetchJourneys = async () => {
    try {
      setLoadingJourneys(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(filter && { filter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/analytics/journeys?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setJourneys(data.journeys);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching journeys:", error);
    } finally {
      setLoadingJourneys(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Traffic & Journeys</h1>
            <p className="text-gray-400 text-sm mt-1">
              Detailed traffic insights and user journeys
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (activeTab === "stats") {
                  handleRefreshStats();
                } else {
                  fetchJourneys();
                }
              }}
              disabled={refreshingStats || loadingJourneys}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <RefreshCcw
                className={`w-4 h-4 ${refreshingStats || loadingJourneys ? "animate-spin" : ""}`}
              />
              {refreshingStats || loadingJourneys ? "Refreshing..." : "Refresh"}
            </button>
            <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "stats"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Visitor Stats
              </button>
              <button
                onClick={() => setActiveTab("journeys")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "journeys"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <Activity className="w-4 h-4" />
                User Journeys
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "stats" ? (
        /* Visitor Stats View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {loadingStats ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  onClick={handleRefreshStats}
                  disabled={refreshingStats}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCcw className={`w-5 h-5 ${refreshingStats ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Visits</p>
                      <h3 className="text-3xl font-bold text-white">
                        {statsData?.totalVisits || 0}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Unique Visitors</p>
                      <h3 className="text-3xl font-bold text-white">
                        {statsData?.uniqueVisitors || 0}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visits Over Time */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                  <h3 className="text-lg font-bold text-white mb-6">Visits (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsData?.visitsByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="_id" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Browser Distribution */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-gray-400" />
                    Browser Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData?.browserStats || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {(statsData?.browserStats || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    {(statsData?.browserStats || []).map((entry: any, index: number) => (
                      <div
                        key={entry._id}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {entry._id || "Unknown"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* OS Distribution */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96 lg:col-span-2">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    Operating Systems
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData?.osStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="_id" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        cursor={{ fill: "#374151", opacity: 0.4 }}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                        {(statsData?.osStats || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        /* User Journeys View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              {["today", "week", "month", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f === "all" ? "" : f);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === (f === "all" ? "" : f)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search visitors..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Journeys Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Landing Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loadingJourneys ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading visitors...
                        </div>
                      </td>
                    </tr>
                  ) : journeys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No visitors found
                      </td>
                    </tr>
                  ) : (
                    journeys.map((journey: any) => (
                      <tr
                        key={journey.visitorId}
                        className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/analytics/${journey.visitorId}`}
                            className="text-blue-400 hover:text-blue-300 font-mono text-sm block"
                          >
                            {journey.visitorId.substring(0, 8)}...
                          </Link>
                          <span className="text-xs text-gray-500">
                            First seen: {new Date(journey.firstSeen).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-white">{journey.device?.type || "Unknown"}</div>
                            <div className="text-gray-400 text-xs">
                              {journey.device?.os || "Unknown"} /{" "}
                              {journey.device?.browser || "Unknown"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white text-sm">{journey.totalSessions}</td>
                        <td
                          className="px-6 py-4 text-white text-sm max-w-[200px] truncate"
                          title={journey.landingPage}
                        >
                          {journey.landingPage}
                        </td>
                        <td className="px-6 py-4 text-white text-sm">
                          {formatDuration(journey.totalDuration)}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(journey.lastActive)}
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
                    className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

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
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";

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
  startTime: string;
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
  const [filter, setFilter] = useState("week");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchJourneys();
  }, [filter, page, search]);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Journey Analytics</h1>
            <p className="text-gray-400">Track visitor behavior and section impressions</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Visitors</p>
                <p className="text-2xl font-bold text-white">{pagination.total}</p>
              </div>
            </div>
          </motion.div>
        </div>

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
                    : "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-secondary" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sections Viewed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
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
                      <td className="px-6 py-4 text-gray-200 text-sm">{journey.landingPage}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-200 capitalize">
                            {journey.device.deviceName || journey.device.type}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {journey.device.os} / {journey.device.browser}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {(journey.events || []).map((event, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                            >
                              {event.sectionId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-200 text-sm">
                        {formatDuration(journey.totalDuration)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(journey.startTime)}
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

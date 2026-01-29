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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen theme-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text mb-2">User Journey Analytics</h1>
          <p className="theme-text-secondary">Track visitor behavior and section impressions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div className="theme-card p-6 rounded-xl border theme-border">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm theme-text-secondary">Total Visitors</p>
                <p className="text-2xl font-bold theme-text">{pagination.total}</p>
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
                    : "theme-card theme-text hover:bg-blue-600/20"
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
                className="w-full pl-10 pr-4 py-2 rounded-lg theme-card theme-text border theme-border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Journeys Table */}
        <div className="theme-card rounded-xl border theme-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Landing Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Sections Viewed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center theme-text-secondary">
                      Loading...
                    </td>
                  </tr>
                ) : journeys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center theme-text-secondary">
                      No journeys found
                    </td>
                  </tr>
                ) : (
                  journeys.map((journey) => (
                    <tr
                      key={journey._id}
                      className="hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/analytics/${journey.sessionId}`}
                          className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                        >
                          {journey.sessionId.substring(0, 12)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 theme-text text-sm">{journey.landingPage}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="theme-text">{journey.device.type}</div>
                          <div className="theme-text-secondary text-xs">
                            {journey.device.os} / {journey.device.browser}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {journey.events.map((event, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                            >
                              {event.sectionId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 theme-text text-sm">
                        {formatDuration(journey.totalDuration)}
                      </td>
                      <td className="px-6 py-4 theme-text-secondary text-sm">
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
            <div className="flex items-center justify-between px-6 py-4 border-t theme-border">
              <div className="theme-text-secondary text-sm">
                Page {page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded theme-card theme-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1 rounded theme-card theme-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/20"
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

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
import { Loader2, Users, Globe, Monitor, Smartphone, RefreshCcw, Activity } from "lucide-react";

export default function StatsPage() {
  // Stats State
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  useEffect(() => {
    fetchStats();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Traffic Overview</h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time traffic statistics and visitor insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
            >
              <Activity className="w-4 h-4" />
              View User Journeys
            </Link>
            <button
              onClick={handleRefreshStats}
              disabled={refreshingStats}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshingStats ? "animate-spin" : ""}`} />
              {refreshingStats ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Visits</p>
                    <h3 className="text-3xl font-bold text-white">{statsData?.totalVisits || 0}</h3>
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
                    <div key={entry._id} className="flex items-center gap-2 text-xs text-gray-400">
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

            {/* New Charts Row: Device Models & Top Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Device Models */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                <h3 className="text-lg font-bold text-white mb-6">Top Device Models</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={statsData?.deviceNameStats || []}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      dataKey="_id"
                      type="category"
                      width={100}
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickFormatter={(value) =>
                        value.length > 15 ? value.substring(0, 15) + "..." : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "#374151" }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]}>
                      {(statsData?.deviceNameStats || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Interactions */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                <h3 className="text-lg font-bold text-white mb-6">Top Interactions (Sections)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData?.eventStats || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="_id"
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickFormatter={(value) =>
                        value.length > 10 ? value.substring(0, 10) + "..." : value
                      }
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "#374151" }}
                      labelFormatter={(label) => `Section: ${label}`}
                    />
                    <Bar dataKey="count" name="Interactions" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Analytics: Clicks & Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Clicks */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                <h3 className="text-lg font-bold text-white mb-6">Top Button Clicks</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData?.clickStats || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="_id"
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickFormatter={(value) =>
                        value && value.length > 10 ? value.substring(0, 10) + "..." : value
                      }
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "#374151" }}
                      labelFormatter={(label) => `Target: ${label}`}
                    />
                    <Bar dataKey="count" name="Clicks" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Inputs */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
                <h3 className="text-lg font-bold text-white mb-6">Top Input Activities</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsData?.inputStats || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="_id"
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickFormatter={(value) =>
                        value && value.length > 10 ? value.substring(0, 10) + "..." : value
                      }
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "#374151" }}
                      labelFormatter={(label) => `Input: ${label}`}
                    />
                    <Bar dataKey="count" name="Interactions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blog Performance */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-6">Blog Engagement (Most Viewed)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="pb-4 pl-4">Blog Path</th>
                      <th className="pb-4">Visits</th>
                      <th className="pb-4">Avg Time</th>
                      <th className="pb-4">Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statsData?.blogStats || []).map((blog: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/50 transition-colors"
                      >
                        <td
                          className="py-4 pl-4 text-white text-sm font-mono max-w-xs truncate"
                          title={blog._id}
                        >
                          {blog._id}
                        </td>
                        <td className="py-4 text-blue-400 font-bold">{blog.visits}</td>
                        <td className="py-4 text-gray-300">{Math.round(blog.avgTime / 1000)}s</td>
                        <td className="py-4 text-gray-300">{Math.round(blog.totalTime / 1000)}s</td>
                      </tr>
                    ))}
                    {(!statsData?.blogStats || statsData.blogStats.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No blog data available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

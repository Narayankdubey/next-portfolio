"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Loader2, Users, Globe, Monitor, Smartphone, RefreshCcw } from "lucide-react";

export default function StatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Visitor Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Detailed insights about your audience</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Visits</p>
              <h3 className="text-3xl font-bold text-white">{data?.totalVisits || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unique Visitors</p>
              <h3 className="text-3xl font-bold text-white">{data?.uniqueVisitors || 0}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visits Over Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96"
        >
          <h3 className="text-lg font-bold text-white mb-6">Visits (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.visitsByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="_id" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
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
        </motion.div>

        {/* Browser Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-gray-400" />
            Browser Distribution
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.browserStats || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {(data?.browserStats || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {(data?.browserStats || []).map((entry: any, index: number) => (
              <div key={entry._id} className="flex items-center gap-2 text-xs text-gray-400">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {entry._id || "Unknown"}
              </div>
            ))}
          </div>
        </motion.div>

        {/* OS Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            Operating Systems
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.osStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="_id" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                cursor={{ fill: "#374151", opacity: 0.4 }}
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                {(data?.osStats || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

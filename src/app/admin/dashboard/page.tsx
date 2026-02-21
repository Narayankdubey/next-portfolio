"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Eye, MessageSquare, Clock, ArrowRight, RefreshCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { formatNumber } from "@/lib/formatUtils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    totalMessages: 0,
    totalChats: 0,
    visitsByDay: [],
    recentMessages: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      setStats({
        totalVisits: data.totalVisits || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        totalMessages: data.totalMessages || 0,
        totalChats: data.totalChats || 0,
        visitsByDay: data.visitsByDay || [],
        recentMessages: data.recentMessages || [],
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500); // Min spin time
  };

  const statCards = [
    { label: "Total Visits", value: stats.totalVisits, icon: Eye, color: "blue" },
    { label: "Unique Visitors", value: stats.uniqueVisitors, icon: Users, color: "purple" },
    { label: "Messages", value: stats.totalMessages, icon: MessageSquare, color: "green" },
    { label: "Chat Sessions", value: stats.totalChats, icon: Clock, color: "orange" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-2">Welcome back to your admin control center.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-500/10`}>
                <card.icon className={`w-6 h-6 text-${card.color}-500`} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(card.value)}</h3>
            <p className="text-sm text-gray-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitor Trends Chart */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96">
          <h2 className="text-xl font-bold text-white mb-6">Journey Trends (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={stats.visitsByDay}>
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
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Messages</h2>
            <Link
              href="/admin/messages"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {stats.recentMessages.length > 0 ? (
              stats.recentMessages.map((msg: any) => (
                <div
                  key={msg._id}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{msg.name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{msg.message}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No recent messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  Mail,
  Calendar,
  Loader2,
  RefreshCcw,
} from "lucide-react";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "read" | "replied">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Optimistic update
    setMessages(
      messages.map((msg) => (msg._id === id ? { ...msg, status: newStatus as any } : msg))
    );

    try {
      await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on failure
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" || msg.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "read":
        return "blue";
      case "replied":
        return "green";
      default:
        return "gray";
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage contact form submissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            {["all", "pending", "read", "replied"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed"
            >
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No messages found</p>
            </motion.div>
          ) : (
            filteredMessages.map((msg) => (
              <motion.div
                key={msg._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.status === "pending" ? "bg-yellow-500/10" : ""}
                      ${msg.status === "read" ? "bg-blue-500/10" : ""}
                      ${msg.status === "replied" ? "bg-green-500/10" : ""}
                    `}
                    >
                      <Mail
                        className={`w-5 h-5
                        ${msg.status === "pending" ? "text-yellow-500" : ""}
                        ${msg.status === "read" ? "text-blue-500" : ""}
                        ${msg.status === "replied" ? "text-green-500" : ""}
                      `}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{msg.name}</h3>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-blue-400 hover:underline text-sm"
                      >
                        {msg.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                      <Clock className="w-3 h-3 ml-2" />
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>

                    <select
                      value={msg.status}
                      onChange={(e) => handleStatusUpdate(msg._id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full outline-none cursor-pointer border border-transparent hover:border-gray-600 transition-colors
                        ${msg.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : ""}
                        ${msg.status === "read" ? "bg-blue-500/10 text-blue-400" : ""}
                        ${msg.status === "replied" ? "bg-green-500/10 text-green-400" : ""}
                      `}
                    >
                      <option value="pending" className="bg-gray-800">
                        Pending
                      </option>
                      <option value="read" className="bg-gray-800">
                        Read
                      </option>
                      <option value="replied" className="bg-gray-800">
                        Replied
                      </option>
                    </select>

                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 text-sm leading-relaxed">
                  {msg.message}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

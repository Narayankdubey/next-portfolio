"use client";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/formatUtils";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Check, X, RefreshCcw, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  blogId: string;
  blogTitle: string;
  content: string;
  authorName: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      const json = await res.json();
      if (json.success) {
        setComments(json.data);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleVisibility = async (commentId: string, isVisible: boolean) => {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, isVisible }),
      });
      const json = await res.json();
      if (json.success) {
        setComments(comments.map((c) => (c.id === commentId ? { ...c, isVisible } : c)));
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "pending") return !c.isVisible;
    if (filter === "approved") return c.isVisible;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingCount = comments.filter((c) => !c.isVisible).length;
  const approvedCount = comments.filter((c) => c.isVisible).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            Comment Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review and moderate blog comments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
          title="Refresh Comments"
        >
          <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl"
        >
          <p className="text-blue-100 text-sm font-medium">Total</p>
          <h3 className="text-3xl font-bold text-white mt-1">{formatNumber(comments.length)}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl"
        >
          <p className="text-orange-100 text-sm font-medium">Pending</p>
          <h3 className="text-3xl font-bold text-white mt-1">{formatNumber(pendingCount)}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl"
        >
          <p className="text-green-100 text-sm font-medium">Approved</p>
          <h3 className="text-3xl font-bold text-white mt-1">{formatNumber(approvedCount)}</h3>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 gap-1">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {f} ({f === "all" ? comments.length : f === "pending" ? pendingCount : approvedCount})
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredComments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed"
            >
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No comments found</p>
            </motion.div>
          ) : (
            filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{comment.blogTitle}</h3>
                    <p className="text-blue-400 text-sm font-medium">by {comment.authorName}</p>
                    <p className="text-gray-500 text-xs mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                  <div>
                    {comment.isVisible ? (
                      <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                </div>

                <div className="flex gap-3">
                  {!comment.isVisible ? (
                    <button
                      onClick={() => handleToggleVisibility(comment.id, true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleVisibility(comment.id, false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Hide
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

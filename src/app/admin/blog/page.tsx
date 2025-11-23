"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Edit, Trash2, Loader2, RefreshCcw, Eye, EyeOff, Search } from "lucide-react";
import BlogForm from "@/components/BlogForm";
import ToggleSwitch from "@/components/ToggleSwitch";

interface BlogPostAdmin {
  id: string;
  title: string;
  description: string;
  content: string;
  type: "internal" | "external";
  externalUrl?: string;
  thumbnailUrl?: string;
  isVisible: boolean;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogPostAdmin | null>(null);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "published" | "hidden">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "internal" | "external">("all");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      } else {
        console.error("Failed to load blog posts", json.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPosts();
      } else {
        alert("Delete failed: " + json.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const payload = { isVisible: !currentVisibility };
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        fetchPosts();
      } else {
        alert("Toggle failed: " + json.error);
      }
    } catch (e) {
      console.error("Toggle error:", e);
      alert("Toggle failed");
    }
  };

  const openCreate = () => {
    setEditPost(null);
    setShowForm(true);
  };

  const openEdit = (post: BlogPostAdmin) => {
    setEditPost(post);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Apply filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase());

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "published" && post.isVisible) ||
      (visibilityFilter === "hidden" && !post.isVisible);

    const matchesType =
      typeFilter === "all" || post.type === typeFilter;

    return matchesSearch && matchesVisibility && matchesType;
  });

  const visibleCount = posts.filter((p) => p.isVisible).length;
  const hiddenCount = posts.filter((p) => !p.isVisible).length;
  const internalCount = posts.filter((p) => p.type === "internal").length;
  const externalCount = posts.filter((p) => p.type === "external").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Blog Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage blog posts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
            title="Refresh Posts"
          >
            <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Post
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Visibility Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 gap-1">
          {(["all", "published", "hidden"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setVisibilityFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                visibilityFilter === f
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 gap-1">
          {(["all", "internal", "external"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                typeFilter === f
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl"
        >
          <p className="text-blue-100 text-sm font-medium">Total Posts</p>
          <h3 className="text-3xl font-bold text-white mt-1">{posts.length}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl"
        >
          <p className="text-green-100 text-sm font-medium">Published</p>
          <h3 className="text-3xl font-bold text-white mt-1">{visibleCount}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-500 to-gray-600 p-6 rounded-xl"
        >
          <p className="text-gray-100 text-sm font-medium">Hidden</p>
          <h3 className="text-3xl font-bold text-white mt-1">{hiddenCount}</h3>
        </motion.div>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed"
            >
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                {posts.length === 0 ? "No blog posts yet" : "No posts match your filters"}
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{post.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          post.type === "internal"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {post.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.description}</p>
                    {post.externalUrl && (
                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-xs"
                      >
                        {post.externalUrl}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Visibility Toggle */}
                    <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg">
                      <ToggleSwitch
                        checked={post.isVisible}
                        onChange={() => handleToggleVisibility(post.id, post.isVisible)}
                      />
                      <span className={`text-xs font-medium ${post.isVisible ? "text-green-400" : "text-gray-500"}`}>
                        {post.isVisible ? "Public" : "Hidden"}
                      </span>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEdit(post)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Blog Form Modal */}
      {showForm && <BlogForm onClose={closeForm} existingPost={editPost} />}
    </div>
  );
}

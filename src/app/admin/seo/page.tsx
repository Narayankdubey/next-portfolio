"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Save, Loader2, Image as ImageIcon, Twitter, Search } from "lucide-react";

interface SEOSettingsData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterHandle: string;
}

export default function SEOManagerPage() {
  const [settings, setSettings] = useState<SEOSettingsData>({
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterHandle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch SEO settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("SEO Settings updated successfully!");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" />
            SEO & Meta Tag Manager
          </h1>
          <p className="text-gray-400 mt-2">
            Configure how your portfolio appears on search engines and social media.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editing Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* General SEO Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              General SEO
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site Title</label>
              <input
                type="text"
                name="title"
                value={settings.title}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Narayan Dubey | Full Stack Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Meta Description
              </label>
              <textarea
                name="description"
                value={settings.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Portfolio of Narayan Dubey..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Keywords</label>
              <input
                type="text"
                name="keywords"
                value={settings.keywords}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="React, Next.js, Developer..."
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated list of keywords</p>
            </div>
          </div>

          {/* Open Graph / Social Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Twitter className="w-5 h-5 text-blue-400" />
              Social Media / Open Graph
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">OG Title</label>
              <input
                type="text"
                name="ogTitle"
                value={settings.ogTitle}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Title shown on social media shares"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">OG Description</label>
              <textarea
                name="ogDescription"
                value={settings.ogDescription}
                onChange={handleChange}
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Description shown on social media shares"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">OG Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="ogImage"
                  value={settings.ogImage}
                  onChange={handleChange}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://yourdomain.com/og-image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Twitter Handle</label>
              <input
                type="text"
                name="twitterHandle"
                value={settings.twitterHandle}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="@username"
              />
            </div>
          </div>
        </motion.div>

        {/* Live Previews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="sticky top-8 space-y-6">
            <h2 className="text-xl font-semibold text-white">Live Previews</h2>

            {/* Google Search Preview */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  N
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    https://yourportfolio.com
                  </div>
                  <div className="text-[12px] text-gray-500 -mt-1">yourportfolio.com</div>
                </div>
              </div>
              <h3 className="text-xl text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer">
                {settings.title || "Your Page Title"}
              </h3>
              <p className="text-sm text-[#4d5156] mt-1 break-words">
                {settings.description || "Your meta description will appear here..."}
              </p>
            </div>

            {/* Twitter/Social Preview */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-sm">
              <div className="w-full h-[200px] bg-gray-100 border-b border-gray-200 flex items-center justify-center overflow-hidden">
                {settings.ogImage ? (
                  <img
                    src={settings.ogImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="p-4 bg-gray-50">
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
                  yourportfolio.com
                </div>
                <h3 className="text-base text-gray-900 font-bold leading-tight mb-1 truncate">
                  {settings.ogTitle || settings.title || "Your Open Graph Title"}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {settings.ogDescription ||
                    settings.description ||
                    "Your social description will appear here when shared on platforms like Twitter or LinkedIn."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

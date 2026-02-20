"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Save,
  Loader2,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Code,
  FormInput,
  User,
  Briefcase,
  Award,
  Stamp,
  Trash2,
  Plus,
} from "lucide-react";

// --- TYPE DEFINITIONS ---

interface SkillsData {
  frontend?: string[];
  backend?: string[];
  tools?: string[];
  other?: string[];
}

interface CertificateData {
  title: string;
  provider: string;
  certificateUrl: string;
  type: "iframe" | "photo";
  url: string;
}

interface PortfolioData {
  personal?: {
    name?: string;
    title?: string;
    tagline?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    profileImage?: string;
  };
  social?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
  about?: {
    bio?: string[];
  };
  skills?: SkillsData;
  certificates?: CertificateData[];
  resumeUrl?: string;
  [key: string]: any;
}

// 1. Define the union type for all valid skill keys
type SkillCategory = keyof SkillsData;

// 2. Define the list of categories using the new type
const SKILL_CATEGORIES: SkillCategory[] = ["frontend", "backend", "tools", "other"];

export default function PortfolioEditor() {
  const [data, setData] = useState<PortfolioData>({});
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editMode, setEditMode] = useState<"ui" | "json">("json");

  const fetchData = async () => {
    setLoading(true);
    try {
      // NOTE: Placeholder fetch calls, replace with actual API endpoint
      const res = await fetch("/api/admin/portfolio");
      const json = await res.json();
      const portfolioData = json.data || {};
      setData(portfolioData);
      setCode(JSON.stringify(portfolioData, null, 2));
      setStatus(null);
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      setStatus({ type: "error", message: "Failed to load portfolio data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      let dataToSave = data;

      if (editMode === "json") {
        try {
          dataToSave = JSON.parse(code);
          setData(dataToSave);
        } catch (e) {
          throw new Error("Invalid JSON format");
        }
      } else {
        setCode(JSON.stringify(data, null, 2));
      }

      console.log("[Admin Portfolio] Saving data:", dataToSave);
      console.log("[Admin Portfolio] resumeUrl:", dataToSave.resumeUrl);

      // NOTE: Placeholder fetch calls, replace with actual API endpoint
      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStatus({ type: "success", message: "Portfolio updated successfully!" });
      setCode(JSON.stringify(dataToSave, null, 2));
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to save changes",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNestedField = (path: string[], value: any) => {
    const newData = { ...data };

    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setData(newData);
  };

  // 3. Update updateSkillCategory signature
  const updateSkillCategory = (category: SkillCategory, skills: string[]) => {
    setData({
      ...data,
      skills: {
        ...(data.skills || {}),
        [category]: skills,
      },
    });
  };

  // 4. Update addSkill signature (Fixed TypeScript Error)
  const addSkill = (category: SkillCategory) => {
    // Prompt is generally discouraged in React, but kept for function parity
    const skill = prompt(`Enter skill for ${category}:`);
    if (skill) {
      // TypeScript now knows category is a valid key
      const currentSkills = data.skills?.[category] || [];
      updateSkillCategory(category, [...currentSkills, skill]);
    }
  };

  // 5. Update removeSkill signature (Fixed TypeScript Error)
  const removeSkill = (category: SkillCategory, index: number) => {
    // TypeScript now knows category is a valid key
    const currentSkills = data.skills?.[category] || [];
    updateSkillCategory(
      category,
      currentSkills.filter((_, i) => i !== index)
    );
  };

  // --- Certificates Functions ---
  const addCertificate = () => {
    const newCert: CertificateData = {
      title: "New Certificate",
      provider: "Provider Name",
      certificateUrl: "",
      type: "photo",
      url: "",
    };
    setData({
      ...data,
      certificates: [...(data.certificates || []), newCert],
    });
  };

  const updateCertificate = (index: number, field: keyof CertificateData, value: string) => {
    const updatedCertificates = [...(data.certificates || [])];
    updatedCertificates[index] = {
      ...updatedCertificates[index],
      [field]: value,
    };
    setData({
      ...data,
      certificates: updatedCertificates,
    });
  };

  const removeCertificate = (index: number) => {
    const updatedCertificates = [...(data.certificates || [])];
    updatedCertificates.splice(index, 1);
    setData({
      ...data,
      certificates: updatedCertificates,
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Portfolio Editor
          </h1>
          <p className="text-gray-400 text-sm mt-1">Edit your portfolio content using UI or JSON</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setEditMode("ui")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editMode === "ui" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <FormInput className="w-4 h-4" />
              UI
            </button>
            <button
              onClick={() => {
                setEditMode("json");
                setCode(JSON.stringify(data, null, 2));
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                editMode === "json" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              JSON
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {status.message}
        </motion.div>
      )}

      {editMode === "json" ? (
        <div className="flex-1">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setStatus(null);
            }}
            className="w-full h-[calc(100vh-16rem)] bg-gray-900 text-gray-300 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            spellCheck="false"
          />
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Personal Information */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={data.personal?.name || ""}
                  onChange={(e) => updateNestedField(["personal", "name"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={data.personal?.title || ""}
                  onChange={(e) => updateNestedField(["personal", "title"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Tagline</label>
                <input
                  type="text"
                  value={data.personal?.tagline || ""}
                  onChange={(e) => updateNestedField(["personal", "tagline"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={data.personal?.email || ""}
                  onChange={(e) => updateNestedField(["personal", "email"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={data.personal?.phone || ""}
                  onChange={(e) => updateNestedField(["personal", "phone"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={data.personal?.location || ""}
                  onChange={(e) => updateNestedField(["personal", "location"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  value={data.personal?.website || ""}
                  onChange={(e) => updateNestedField(["personal", "website"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Resume URL (Google Drive PDF Link)
                </label>
                <input
                  type="url"
                  value={data.resumeUrl || ""}
                  onChange={(e) => setData({ ...data, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Social Links</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">GitHub</label>
                <input
                  type="url"
                  value={data.social?.github || ""}
                  onChange={(e) => updateNestedField(["social", "github"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={data.social?.linkedin || ""}
                  onChange={(e) => updateNestedField(["social", "linkedin"], e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              Skills
            </h2>

            {/* Using the type-safe SKILL_CATEGORIES array */}
            {SKILL_CATEGORIES.map((category) => (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300 capitalize">{category}</h3>
                  <button
                    onClick={() => addSkill(category)}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data.skills?.[category] || []).map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg group"
                    >
                      <span className="text-gray-300 text-sm">{skill}</span>
                      <button
                        onClick={() => removeSkill(category, index)}
                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!data.skills?.[category] || data.skills[category].length === 0) && (
                    <p className="text-gray-500 text-sm">No {category} skills added</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Certificates */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Stamp className="w-5 h-5 text-green-500" />
                Certificates
              </h2>
              <button
                onClick={addCertificate}
                className="flex items-center gap-1 text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>

            <div className="space-y-4">
              {(data.certificates || []).map((cert, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 relative group"
                >
                  <button
                    onClick={() => removeCertificate(index)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors bg-gray-800 rounded p-1.5 md:opacity-0 group-hover:opacity-100"
                    title="Remove Certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => updateCertificate(index, "title", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Provider</label>
                      <input
                        type="text"
                        value={cert.provider}
                        onChange={(e) => updateCertificate(index, "provider", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Type</label>
                      <select
                        value={cert.type}
                        onChange={(e) => updateCertificate(index, "type", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      >
                        <option value="photo">Photo / Image</option>
                        <option value="iframe">Iframe / Embed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Certificate External URL
                      </label>
                      <input
                        type="url"
                        value={cert.certificateUrl}
                        onChange={(e) => updateCertificate(index, "certificateUrl", e.target.value)}
                        placeholder="https://provider.com/verify/123"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">
                        Source URL (Image Link or Embed URL)
                      </label>
                      <input
                        type="url"
                        value={cert.url}
                        onChange={(e) => updateCertificate(index, "url", e.target.value)}
                        placeholder="https://image-host.com/cert.jpg"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!data.certificates || data.certificates.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4 bg-gray-900 rounded-xl border border-gray-800">
                  No certificates added yet. Click &quot;Add Certificate&quot; to begin.
                </p>
              )}
            </div>
          </div>

          {/* Complex Data Notice */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Complex Data Structures</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  For editing complex data like <strong>Experience</strong>,{" "}
                  <strong>Projects</strong> (including{" "}
                  <strong className="text-green-400">Play Store</strong> &{" "}
                  <strong className="text-blue-400">App Store URLs</strong>),{" "}
                  <strong>Education</strong>, <strong>Awards</strong>, <strong>Testimonials</strong>
                  , and <strong>Achievements</strong>, please use the{" "}
                  <strong className="text-blue-400">JSON Editor</strong> mode. The JSON mode
                  provides full control over nested arrays and objects.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

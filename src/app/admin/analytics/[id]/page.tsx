"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Monitor,
  Eye,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface SectionImpression {
  sectionId: string;
  viewedAt: string;
  duration: number;
  scrollDepth: number;
  interactions: number;
}

interface Action {
  type: string;
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Journey {
  _id: string;
  sessionId: string;
  visitorId: string;
  landingPage: string;
  referrer: string;
  userAgent: string;
  device: {
    type: string;
    os: string;
    browser: string;
    deviceName: string;
  };
  location?: {
    country?: string;
    city?: string;
    ip?: string;
  };
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  events: SectionImpression[];
  actions: Action[];
}

const sectionColors: Record<string, string> = {
  hero: "bg-blue-500",
  about: "bg-purple-500",
  skills: "bg-green-500",
  projects: "bg-yellow-500",
  experience: "bg-red-500",
  testimonials: "bg-pink-500",
  contact: "bg-cyan-500",
  blog: "bg-orange-500",
};

export default function JourneyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchJourneys();
  }, [id]);

  const fetchJourneys = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/analytics/journey/${id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setJourneys(data.journeys);
      // Auto-expand the most recent session
      if (data.journeys && data.journeys.length > 0) {
        setExpandedSession(data.journeys[0].sessionId);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return "N/A";
    if (ms < 1000) return "< 1s";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatDate = (dateString: any) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-200">Loading visitor history...</div>
      </div>
    );
  }

  if (!journeys || journeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Visitor not found or no sessions recorded.</div>
      </div>
    );
  }

  const latestJourney = journeys[0];

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analytics
            </Link>
            <button
              onClick={fetchJourneys}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Visitor Details</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
            <span>ID: {latestJourney.visitorId}</span>
            <span>•</span>
            <span>{journeys.length} Sessions</span>
            <span>•</span>
            <span>First Seen: {formatDate(journeys[journeys.length - 1].startTime)}</span>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {journeys.map((journey) => (
            <div
              key={journey.sessionId}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
            >
              {/* Session Header */}
              <div
                className="p-4 bg-gray-800/50 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() =>
                  setExpandedSession(
                    expandedSession === journey.sessionId ? null : journey.sessionId
                  )
                }
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-200 font-medium">
                      {formatDate(journey.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">
                      {journey.device.deviceName || journey.device.type} ({journey.device.browser})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">
                      {formatDuration(journey.totalDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm px-2 py-0.5 bg-gray-700 rounded">
                      {journey.events.length} interactions
                    </span>
                  </div>
                </div>
                {expandedSession === journey.sessionId ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedSession === journey.sessionId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-6 border-t border-gray-700 bg-gray-900/20">
                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Landing Page</p>
                          <p className="text-gray-200 text-sm truncate" title={journey.landingPage}>
                            {journey.landingPage}
                          </p>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Referrer</p>
                          <p className="text-gray-200 text-sm truncate" title={journey.referrer}>
                            {journey.referrer || "Direct"}
                          </p>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Location (IP)</p>
                          <p className="text-gray-200 text-sm">
                            {journey.location?.ip || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Activity Timeline
                        </h3>
                        <div className="space-y-4 relative pl-2">
                          {/* Vertical Line */}
                          <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-800" />

                          {(() => {
                            // Merge events and actions
                            const combinedEvents = [
                              ...(journey.events || []).map((e) => ({
                                type: "view",
                                data: e,
                                time: new Date(e.viewedAt).getTime(),
                              })),
                              ...(journey.actions || []).map((a) => ({
                                type: "action",
                                data: a,
                                time: new Date(a.timestamp).getTime(),
                              })),
                            ].sort((a, b) => a.time - b.time);

                            return combinedEvents.map((item, index) => {
                              if (item.type === "view") {
                                const event = item.data as SectionImpression;
                                return (
                                  <div
                                    key={`view-${index}`}
                                    className="relative flex items-start gap-4"
                                  >
                                    <div
                                      className={`z-10 w-4 h-4 mt-1 rounded-full border-2 border-gray-900 ${sectionColors[event.sectionId] || "bg-gray-500"}`}
                                    />
                                    <div className="flex-1 bg-gray-800 p-3 rounded-lg border border-gray-700 bg-gray-800/40">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-gray-200 font-medium text-sm capitalize">
                                            {event.sectionId} Section
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            Viewed at {formatDate(event.viewedAt)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-gray-200 text-sm">
                                            {formatDuration(event.duration)}
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            {event.scrollDepth}% scroll
                                          </p>
                                        </div>
                                      </div>
                                      {/* Scroll Bar */}
                                      <div className="mt-2 h-1.5 bg-gray-700/50 rounded-full overflow-hidden w-full max-w-[100px] ml-auto">
                                        <div
                                          className={`h-full ${sectionColors[event.sectionId] || "bg-gray-500"}`}
                                          style={{ width: `${event.scrollDepth}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                const action = item.data as Action;
                                return (
                                  <div
                                    key={`action-${index}`}
                                    className="relative flex items-start gap-4"
                                  >
                                    <div className="z-10 w-4 h-4 mt-1 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    </div>
                                    <div className="flex-1 bg-blue-900/10 p-3 rounded-lg border border-blue-900/20">
                                      <div className="flex justify-between items-start">
                                        <div className="w-full">
                                          <p className="text-blue-300 font-medium text-sm capitalize">
                                            {action.type === "click" ? "Clicked" : action.type}{" "}
                                            {action.metadata?.label || action.target}
                                          </p>
                                          <p className="text-blue-400/60 text-xs mb-1">
                                            At {formatDate(action.timestamp)}
                                          </p>

                                          {/* Render Metadata if present */}
                                          {action.metadata &&
                                            Object.keys(action.metadata).length > 0 && (
                                              <div className="mt-2 text-xs bg-gray-900/50 p-2 rounded border border-gray-700 font-mono text-gray-300 overflow-x-auto">
                                                <pre>
                                                  {JSON.stringify(action.metadata, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Monitor, Eye, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SectionImpression {
  sectionId: string;
  viewedAt: string;
  duration: number;
  scrollDepth: number;
  interactions: number;
}

interface Journey {
  sessionId: string;
  visitorId: string;
  landingPage: string;
  referrer: string;
  userAgent: string;
  device: {
    type: string;
    os: string;
    browser: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  events: SectionImpression[];
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

export default function JourneyDetailPage({ params }: { params: { id: string } }) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchJourney();
  }, [params.id]);

  const fetchJourney = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/journey/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setJourney(data.journey);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="theme-text">Loading...</div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="theme-text">Journey not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </Link>
          <h1 className="text-4xl font-bold theme-text mb-2">User Journey Details</h1>
          <p className="theme-text-secondary font-mono text-sm">{journey.sessionId}</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="theme-card p-4 rounded-xl border theme-border">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-xs theme-text-secondary">Landing Page</p>
                <p className="theme-text font-medium">{journey.landingPage}</p>
              </div>
            </div>
          </div>

          <div className="theme-card p-4 rounded-xl border theme-border">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-xs theme-text-secondary">Device</p>
                <p className="theme-text font-medium">
                  {journey.device.type} / {journey.device.browser}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-4 rounded-xl border theme-border">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-xs theme-text-secondary">Duration</p>
                <p className="theme-text font-medium">
                  {journey.totalDuration ? formatDuration(journey.totalDuration) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-4 rounded-xl border theme-border">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-xs theme-text-secondary">Sections Viewed</p>
                <p className="theme-text font-medium">{journey.events.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="theme-card p-6 rounded-xl border theme-border">
          <h2 className="text-2xl font-bold theme-text mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Journey Timeline
          </h2>

          <div className="space-y-4">
            {journey.events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      sectionColors[event.sectionId] || "bg-gray-500"
                    }`}
                  />
                  {index < journey.events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-700 mt-2" />
                  )}
                </div>

                {/* Event card */}
                <div className="flex-1 theme-card border theme-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold theme-text capitalize">{event.sectionId} Section</h3>
                      <p className="text-sm theme-text-secondary">
                        {new Date(event.viewedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm theme-text">{formatDuration(event.duration)}</div>
                      <div className="text-xs theme-text-secondary">
                        {event.scrollDepth}% scrolled
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for scroll depth */}
                  <div className="mt-3 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${sectionColors[event.sectionId] || "bg-gray-500"}`}
                      style={{ width: `${event.scrollDepth}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 theme-card p-6 rounded-xl border theme-border">
          <h3 className="text-xl font-bold theme-text mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm theme-text-secondary">Visitor ID</p>
              <p className="theme-text font-mono text-sm">{journey.visitorId}</p>
            </div>
            <div>
              <p className="text-sm theme-text-secondary">Referrer</p>
              <p className="theme-text text-sm">{journey.referrer || "Direct"}</p>
            </div>
            <div>
              <p className="text-sm theme-text-secondary">Started At</p>
              <p className="theme-text text-sm">{new Date(journey.startTime).toLocaleString()}</p>
            </div>
            {journey.endTime && (
              <div>
                <p className="text-sm theme-text-secondary">Ended At</p>
                <p className="theme-text text-sm">{new Date(journey.endTime).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

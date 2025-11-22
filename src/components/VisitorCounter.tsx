"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

export default function VisitorCounter() {
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [uniqueVisitors, setUniqueVisitors] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/analytics/total");
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setTotalVisits(data.totalVisits);
        setUniqueVisitors(data.uniqueVisitors);
      } catch (error) {
        console.error("Failed to load visitor stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (totalVisits === null) return null;

  return (
    <div className="inline-flex items-center gap-2 text-sm theme-text-secondary">
      <Eye className="w-4 h-4" />
      <span>
        {totalVisits.toLocaleString()} {totalVisits === 1 ? "visit" : "visits"}
      </span>
    </div>
  );
}

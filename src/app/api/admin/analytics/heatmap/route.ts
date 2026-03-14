import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

const SECTION_ORDER = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "testimonials",
  "contact",
  "blog",
  "blog-listing",
  "blog-detail",
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "/";
    const days = parseInt(searchParams.get("days") || "30", 10);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // ---- Click Heatmap: aggregate x/y coordinates ----
    const clickAgg = await (UserJourney as any).aggregate([
      { $match: { startTime: { $gte: since } } },
      { $unwind: "$actions" },
      {
        $match: {
          "actions.type": "page-click",
          "actions.x": { $exists: true },
          "actions.y": { $exists: true },
          "actions.metadata.page": page,
        },
      },
      {
        $project: {
          // Bucket to the nearest integer percentile for grouping
          x: { $round: ["$actions.x", 0] },
          y: { $round: ["$actions.y", 0] },
        },
      },
      {
        $group: {
          _id: { x: "$x", y: "$y" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, x: "$_id.x", y: "$_id.y", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 500 },
    ]);

    // ---- Scroll Depth: average per section ----
    const scrollAgg = await (UserJourney as any).aggregate([
      { $match: { startTime: { $gte: since } } },
      { $unwind: "$events" },
      {
        $group: {
          _id: "$events.sectionId",
          avgScrollDepth: { $avg: "$events.scrollDepth" },
          avgDuration: { $avg: "$events.duration" },
          avgInteractions: { $avg: "$events.interactions" },
          visitorCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          section: "$_id",
          avgScrollDepth: { $round: ["$avgScrollDepth", 1] },
          avgDuration: { $round: ["$avgDuration", 0] },
          avgInteractions: { $round: ["$avgInteractions", 1] },
          visitorCount: 1,
        },
      },
    ]);

    // Sort scroll data by canonical section order
    const scrollData = scrollAgg.sort((a: any, b: any) => {
      const ai = SECTION_ORDER.indexOf(a.section);
      const bi = SECTION_ORDER.indexOf(b.section);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    // ---- Funnel: % of total visitors who viewed each section ----
    const totalVisitors = await (UserJourney as any).countDocuments({
      startTime: { $gte: since },
    });

    const funnelAgg = await (UserJourney as any).aggregate([
      { $match: { startTime: { $gte: since } } },
      { $unwind: "$events" },
      {
        $group: {
          _id: "$events.sectionId",
          uniqueVisitors: { $addToSet: "$visitorId" },
        },
      },
      {
        $project: {
          _id: 0,
          section: "$_id",
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
    ]);

    const funnelData = funnelAgg
      .map((f: any) => ({
        ...f,
        pct:
          totalVisitors > 0 ? parseFloat(((f.uniqueVisitors / totalVisitors) * 100).toFixed(1)) : 0,
      }))
      .sort((a: any, b: any) => {
        const ai = SECTION_ORDER.indexOf(a.section);
        const bi = SECTION_ORDER.indexOf(b.section);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });

    // ---- Available pages ----
    const pages = await (UserJourney as any).aggregate([
      { $match: { startTime: { $gte: since } } },
      { $unwind: "$actions" },
      { $match: { "actions.type": "page-click", "actions.metadata.page": { $exists: true } } },
      { $group: { _id: "$actions.metadata.page" } },
      { $project: { _id: 0, page: "$_id" } },
      { $sort: { page: 1 } },
    ]);

    // Always include / and /blog as baseline options
    const pageList = Array.from(new Set(["/", "/blog", ...pages.map((p: any) => p.page)])).sort();

    return NextResponse.json({
      clicks: clickAgg,
      scrollData,
      funnelData,
      totalVisitors,
      pages: pageList,
    });
  } catch (error) {
    console.error("Heatmap API error:", error);
    return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
  }
}

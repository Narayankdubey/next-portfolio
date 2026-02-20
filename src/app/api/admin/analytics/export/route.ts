import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin authentication
    // const authResult = await verifyAuth(request);
    // if (!authResult.authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "visitors"; // 'visitors' or 'sessions'
    const filter = searchParams.get("filter"); // 'today', 'week', 'month'
    const search = searchParams.get("search");
    const deviceType = searchParams.getAll("deviceType");
    const os = searchParams.getAll("os");
    const browser = searchParams.getAll("browser");
    const location = searchParams.getAll("location");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const interaction = searchParams.get("interaction");
    const sortField = searchParams.get("sortField") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    //Build query logic (replicated from journeys/route.ts)
    const matchStage: any = {};

    // Date filter
    if (filter) {
      const now = new Date();
      let startDate: Date;

      switch (filter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      matchStage.startTime = { $gte: startDate };
    }

    // Duration filter bounds
    if (minDuration || maxDuration) {
      matchStage.totalDuration = {};
      if (minDuration) matchStage.totalDuration.$gte = parseInt(minDuration) * 1000;
      if (maxDuration) matchStage.totalDuration.$lte = parseInt(maxDuration) * 1000;
    }

    // Additional filters (Arrays)
    if (deviceType.length > 0) matchStage["device.type"] = { $in: deviceType };
    if (os.length > 0) matchStage["device.os"] = { $in: os };
    if (browser.length > 0) matchStage["device.browser"] = { $in: browser };
    if (location.length > 0) {
      if (location.includes("Unknown")) {
        const knownLocations = location.filter((l) => l !== "Unknown");
        matchStage.$or = matchStage.$or || [];
        matchStage.$or.push(
          { "location.city": { $exists: false } },
          { "location.city": null },
          { "location.city": "" },
          { "location.city": "Unknown" }
        );
        if (knownLocations.length > 0) {
          matchStage.$or.push({ "location.city": { $in: knownLocations } });
        }
      } else {
        matchStage["location.city"] = { $in: location };
      }
    }

    // Interaction filter
    if (interaction) {
      matchStage.$and = matchStage.$and || [];
      matchStage.$and.push({
        $or: [
          { "events.sectionId": { $regex: interaction, $options: "i" } },
          { "actions.target": { $regex: interaction, $options: "i" } },
          { "actions.type": { $regex: interaction, $options: "i" } },
          { "actions.metadata.label": { $regex: interaction, $options: "i" } },
        ],
      });
    }

    // Search filter
    if (search) {
      matchStage.$or = [
        { sessionId: { $regex: search, $options: "i" } },
        { visitorId: { $regex: search, $options: "i" } },
        { landingPage: { $regex: search, $options: "i" } },
      ];
    }

    // Pipeline for aggregation
    const pipeline: any[] = [{ $match: matchStage }];

    if (type === "visitors") {
      pipeline.push(
        { $sort: { updatedAt: -1 } },
        {
          $group: {
            _id: "$visitorId",
            visitorId: { $first: "$visitorId" },
            sessionId: { $first: "$sessionId" }, // Most recent session ID
            startTime: { $first: "$startTime" },
            updatedAt: { $first: "$updatedAt" },
            endTime: { $first: "$endTime" },
            firstSeen: { $last: "$startTime" },
            totalSessions: { $sum: 1 },
            landingPage: { $first: "$landingPage" },
            device: { $first: "$device" },
            referrer: { $first: "$referrer" },
            events: { $first: "$events" },
            totalDuration: { $sum: "$totalDuration" },
          },
        }
      );
    } else if (type === "events") {
      // For granular events export
      pipeline.push(
        {
          $project: {
            visitorId: 1,
            sessionId: 1,
            interactions: {
              $concatArrays: [
                {
                  $map: {
                    input: { $ifNull: ["$events", []] },
                    as: "event",
                    in: {
                      type: "View",
                      timestamp: "$$event.viewedAt",
                      detail: "$$event.sectionId",
                      duration: "$$event.duration",
                      metadata: { scrollDepth: "$$event.scrollDepth" },
                    },
                  },
                },
                {
                  $map: {
                    input: { $ifNull: ["$actions", []] },
                    as: "action",
                    in: {
                      type: "Action",
                      timestamp: "$$action.timestamp",
                      detail: { $concat: ["$$action.type", " ", "$$action.target"] },
                      duration: 0,
                      metadata: "$$action.metadata",
                    },
                  },
                },
              ],
            },
          },
        },
        { $unwind: "$interactions" },
        { $sort: { "interactions.timestamp": 1 } }
      );
    } else {
      // For sessions, we might just want to return them as is, but ensuring fields exist
      // Use sort as regular stage
    }

    // Apply sort only if not events (events are sorted by timestamp)
    if (type !== "events") {
      pipeline.push({ $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } });
    }

    const journeys = await UserJourney.aggregate(pipeline);

    // Convert to CSV
    let headers: string[] = [];
    let csvRows: string[] = [];

    if (type === "events") {
      headers = [
        "Visitor ID",
        "Session ID",
        "Timestamp",
        "Type",
        "Detail",
        "Duration (s)",
        "Metadata",
      ];

      csvRows = journeys.map((row) => {
        const i = row.interactions;
        return [
          row.visitorId,
          row.sessionId,
          new Date(i.timestamp).toISOString(),
          i.type,
          `"${(i.detail || "").replace(/"/g, '""')}"`,
          ((i.duration || 0) / 1000).toFixed(2),
          `"${JSON.stringify(i.metadata || {}).replace(/"/g, '""')}"`,
        ].join(",");
      });
    } else {
      headers = [
        "Visitor ID",
        "Session ID",
        "Start Time",
        "Last Active",
        "Duration (s)",
        type === "visitors" ? "Total Sessions" : "Interactions",
        "Landing Page",
        "Device Type",
        "OS",
        "Browser",
      ];

      csvRows = journeys.map((journey) => {
        return [
          journey.visitorId,
          journey.sessionId,
          new Date(journey.startTime).toISOString(),
          new Date(journey.updatedAt).toISOString(),
          ((journey.totalDuration || 0) / 1000).toFixed(2),
          type === "visitors"
            ? journey.totalSessions
            : (journey.events?.length || 0) + (journey.actions?.length || 0),
          `"${(journey.landingPage || "").replace(/"/g, '""')}"`, // Escape quotes
          journey.device?.type || "unknown",
          journey.device?.os || "unknown",
          journey.device?.browser || "unknown",
        ].join(",");
      });
    }

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const date = new Date().toISOString().split("T")[0];
    const filename = `analytics-export-${type}-${date}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export journeys error:", error);
    return NextResponse.json({ error: "Failed to export journeys" }, { status: 500 });
  }
}

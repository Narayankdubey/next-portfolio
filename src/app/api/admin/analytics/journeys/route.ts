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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter"); // 'today', 'week', 'month'
    const search = searchParams.get("search");
    const deviceType = searchParams.get("deviceType");
    const os = searchParams.get("os");
    const browser = searchParams.get("browser");
    const interaction = searchParams.get("interaction");

    const skip = (page - 1) * limit;

    //Build query
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

    // Additional filters
    if (deviceType && deviceType !== "all") matchStage["device.type"] = deviceType;
    if (os && os !== "all") matchStage["device.os"] = os;
    if (browser && browser !== "all") matchStage["device.browser"] = browser;

    // Interaction filter (searches events and actions)
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

    const pipeline: any[] = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$visitorId",
          visitorId: { $first: "$visitorId" },
          sessionId: { $first: "$sessionId" },
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
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Get total count of unique visitors for pagination
    const countPipeline = [
      { $match: matchStage },
      { $group: { _id: "$visitorId" } },
      { $count: "total" },
    ];

    const statsPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: "$totalDuration" },
          totalEvents: {
            $sum: {
              $add: [
                { $size: { $ifNull: ["$events", []] } },
                { $size: { $ifNull: ["$actions", []] } },
              ],
            },
          },
        },
      },
    ];

    const [journeys, countResult, statsResult] = await Promise.all([
      UserJourney.aggregate(pipeline),
      UserJourney.aggregate(countPipeline),
      UserJourney.aggregate(statsPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;
    const stats =
      statsResult.length > 0
        ? statsResult[0]
        : { totalSessions: 0, totalDuration: 0, totalEvents: 0 };

    return NextResponse.json({
      journeys,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get journeys error:", error);
    return NextResponse.json({ error: "Failed to fetch journeys" }, { status: 500 });
  }
}

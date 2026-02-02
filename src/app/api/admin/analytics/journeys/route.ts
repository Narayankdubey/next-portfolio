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
      { $sort: { startTime: -1 } },
      {
        $group: {
          _id: "$visitorId",
          visitorId: { $first: "$visitorId" },
          latestSessionId: { $first: "$sessionId" },
          lastActive: { $first: "$startTime" },
          firstSeen: { $last: "$startTime" },
          totalSessions: { $sum: 1 },
          landingPage: { $first: "$landingPage" },
          device: { $first: "$device" },
          referrer: { $first: "$referrer" },
          totalDuration: { $sum: "$totalDuration" },
        },
      },
      { $sort: { lastActive: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Get total count of unique visitors for pagination
    const countPipeline = [
      { $match: matchStage },
      { $group: { _id: "$visitorId" } },
      { $count: "total" },
    ];

    const [journeys, countResult] = await Promise.all([
      UserJourney.aggregate(pipeline),
      UserJourney.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json({
      journeys,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get journeys error:", error);
    return NextResponse.json({ error: "Failed to fetch journeys" }, { status: 500 });
  }
}

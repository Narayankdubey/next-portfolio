import { NextRequest, NextResponse } from "next/server";
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
    const query: any = {};

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

      query.startTime = { $gte: startDate };
    }

    // Search filter (by sessionId or visitorId)
    if (search) {
      query.$or = [
        { sessionId: { $regex: search, $options: "i" } },
        { visitorId: { $regex: search, $options: "i" } },
        { landingPage: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserJourney.countDocuments(query);
    const journeys = await UserJourney.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

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

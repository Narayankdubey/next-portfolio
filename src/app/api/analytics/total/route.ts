import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function GET() {
  try {
    await dbConnect();

    // Count total sessions (visits)
    const totalVisits = await UserJourney.countDocuments();

    // Count unique visitors
    const uniqueVisitors = await UserJourney.distinct("visitorId").then(
      (visitors) => visitors.length
    );

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
    });
  } catch (error) {
    console.error("Total visits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

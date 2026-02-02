import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication (simplified - update with your auth logic)
    // const authResult = await verifyAuth(request);
    // if (!authResult.authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await dbConnect();

    const { id } = await params;

    // Fetch all journeys for this visitor
    const journeys = await UserJourney.find({ visitorId: id })
      .sort({ startTime: -1 })
      .select("-__v")
      .lean();

    if (!journeys || journeys.length === 0) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json({ journeys });
  } catch (error) {
    console.error("Get journey error:", error);
    return NextResponse.json({ error: "Failed to fetch journey" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sessionId, type, target, metadata } = body;

    if (!sessionId || !type || !target) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, type, target" },
        { status: 400 }
      );
    }

    const journey = await UserJourney.findOne({ sessionId });

    if (!journey) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Add action to journey
    journey.actions = journey.actions || [];
    journey.actions.push({
      type,
      target,
      timestamp: new Date(),
      metadata,
    });

    // Update last activity time
    journey.endTime = new Date();
    // Update total duration (rough estimate)
    journey.totalDuration = journey.endTime.getTime() - journey.startTime.getTime();

    await journey.save();

    return NextResponse.json({
      success: true,
      message: "Action tracked",
    });
  } catch (error) {
    console.error("Track action error:", error);
    return NextResponse.json({ error: "Failed to track action" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sessionId, sectionId, interactionId, duration, scrollDepth, interactions } = body;

    if (!sessionId || !sectionId) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, sectionId" },
        { status: 400 }
      );
    }

    let retries = 3;
    while (retries > 0) {
      try {
        const journey = await UserJourney.findOne({ sessionId });

        if (!journey) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Check if distinct interaction already tracked
        const existingEvent = interactionId
          ? journey.events.find((e) => e.interactionId === interactionId)
          : fallbackFind(journey.events, sectionId);

        function fallbackFind(events: any[], secId: string) {
          return events.find((e) => e.sectionId === secId);
        }

        if (existingEvent) {
          // Update existing event with new data (e.g., increased duration)
          existingEvent.duration = duration || existingEvent.duration;
          existingEvent.scrollDepth = Math.max(scrollDepth || 0, existingEvent.scrollDepth);
          existingEvent.interactions = (existingEvent.interactions || 0) + (interactions || 0);
        } else {
          // Add new section impression
          journey.events.push({
            interactionId: interactionId || `legacy-${Date.now()}`,
            sectionId,
            viewedAt: new Date(),
            duration: duration || 0,
            scrollDepth: scrollDepth || 0,
            interactions: interactions || 0,
          });
        }

        // Update total duration
        const now = new Date();
        journey.totalDuration = now.getTime() - journey.startTime.getTime();
        journey.endTime = now;

        await journey.save();

        // Success
        return NextResponse.json({
          success: true,
          message: "Section impression tracked",
        });
      } catch (saveError: any) {
        if (saveError.name === "VersionError" && retries > 1) {
          console.log("VersionError encountered, retrying... Attempts left:", retries - 1);
          retries--;
          continue; // Retry logic
        }
        throw saveError; // Re-throw if not version error or out of retries
      }
    }
  } catch (error) {
    console.error("Track event error:", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}

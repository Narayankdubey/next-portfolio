import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";
import { generateSessionId, parseUserAgent } from "@/utils/fingerprint";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { visitorId, landingPage, referrer, userAgent } = body;

    if (!visitorId || !landingPage || !userAgent) {
      return NextResponse.json(
        { error: "Missing required fields: visitorId, landingPage, userAgent" },
        { status: 400 }
      );
    }

    const sessionId = generateSessionId();
    const device = parseUserAgent(userAgent);

    // Get location from IP (optional - would need IP geolocation service)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");

    const journey = await UserJourney.create({
      sessionId,
      visitorId,
      landingPage,
      referrer: referrer || "direct",
      userAgent,
      device,
      location: ip ? { ip } : undefined,
      startTime: new Date(),
      events: [],
    });

    return NextResponse.json({
      success: true,
      sessionId: journey.sessionId,
      visitorId: journey.visitorId,
    });
  } catch (error) {
    console.error("Session initialization error:", error);
    return NextResponse.json({ error: "Failed to initialize session" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const journey = await UserJourney.findOne({ sessionId });

    if (!journey) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ journey });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

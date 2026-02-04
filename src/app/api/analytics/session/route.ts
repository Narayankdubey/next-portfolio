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

    // Get location from IP
    let ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip");

    // Handle localhost/internal IPs for dev
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "";
    }

    let locationData = { ip: ip || undefined };

    if (ip) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            locationData = {
              ip,
              ...(geoData.country && { country: geoData.country }),
              ...(geoData.regionName && { region: geoData.regionName }),
              ...(geoData.city && { city: geoData.city }),
            };
          }
        }
      } catch (e) {
        console.error("Failed to fetch location data", e);
      }
    }

    const journey = await UserJourney.create({
      sessionId,
      visitorId,
      landingPage,
      referrer: referrer || "direct",
      userAgent,
      device,
      location: locationData,
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

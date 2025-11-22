import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VisitorStats from "@/models/VisitorStats";
import VisitLog from "@/models/VisitLog";

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      browser,
      os,
      device,
      screenResolution,
      timezone,
      language,
      referrer,
      userAgent,
      latitude,
      longitude,
    } = await request.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Create a new visit log entry for EVERY visit with full details
    await VisitLog.create({
      userId,
      visitTime: new Date(),
      browser,
      os,
      device,
      screenResolution,
      timezone,
      language,
      referrer,
      userAgent,
      latitude,
      longitude,
    });

    // 2. Update or create visitor stats (just for counting)
    const stats = await VisitorStats.findOne({ userId });

    if (stats) {
      // Just increment count and update timestamps
      stats.visitCount += 1;
      stats.lastVisit = new Date();
      await stats.save();

      return NextResponse.json({
        success: true,
        visitCount: stats.visitCount,
      });
    } else {
      // Create new visitor stats record (no detailed info, just counting)
      const newStats = await VisitorStats.create({
        userId,
        visitCount: 1,
        lastVisit: new Date(),
        firstVisit: new Date(),
      });

      return NextResponse.json({
        success: true,
        visitCount: newStats.visitCount,
      });
    }
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

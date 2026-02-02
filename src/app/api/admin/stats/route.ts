import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";
import Contact from "@/models/Contact";
import ChatMessage from "@/models/ChatMessage";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

// Middleware helper to check auth
async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) return false;
  try {
    jwt.verify(token.value, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Get total counts from UserJourney
    const totalVisits = await UserJourney.countDocuments();
    const uniqueVisitorsList = await UserJourney.distinct("visitorId");
    const uniqueVisitors = uniqueVisitorsList.length;
    const totalMessages = await Contact.countDocuments();

    // Get total chat sessions (unique users who have chatted)
    const uniqueChatUsers = await ChatMessage.distinct("userId");
    const totalChats = uniqueChatUsers.length;

    // Get visits over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const visitsByDay = await UserJourney.aggregate([
      {
        $match: {
          startTime: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get browser stats
    const browserStats = await UserJourney.aggregate([
      {
        $group: {
          _id: "$device.browser",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get OS stats
    const osStats = await UserJourney.aggregate([
      {
        $group: {
          _id: "$device.os",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get recent messages
    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email message createdAt status");

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      totalMessages,
      totalChats,
      visitsByDay,
      browserStats,
      osStats,
      recentMessages,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

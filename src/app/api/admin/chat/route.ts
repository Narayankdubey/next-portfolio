import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
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

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Debug: Check total count
    const totalCount = await ChatMessage.countDocuments();
    console.log("Admin Chat API - Total messages:", totalCount);

    // Aggregate messages by userId to create sessions
    let sessions = await ChatMessage.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
          messages: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.timestamp": -1 },
      },
    ]);

    console.log("Admin Chat API - Sessions found:", sessions.length);

    // Fallback: If aggregation returns nothing but we have messages,
    // manually construct a session for debugging
    if (sessions.length === 0 && totalCount > 0) {
      console.log("⚠️ Aggregation failed but messages exist. Fetching raw messages.");
      const rawMessages = await ChatMessage.find().sort({ timestamp: -1 }).limit(50);

      // Group manually
      const groups: Record<string, any> = {};
      rawMessages.forEach((msg: any) => {
        if (!groups[msg.userId]) {
          groups[msg.userId] = {
            _id: msg.userId,
            lastMessage: msg,
            messageCount: 0,
            messages: [],
          };
        }
        groups[msg.userId].messages.push(msg);
        groups[msg.userId].messageCount++;
      });

      sessions = Object.values(groups);
    }

    return NextResponse.json({
      sessions,
      debug: {
        totalMessages: totalCount,
        collectionName: ChatMessage.collection.name,
      },
    });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

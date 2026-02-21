import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import Comment from "@/models/Comment";
import ContactMessage from "@/models/ContactMessage";
import ChatMessage from "@/models/ChatMessage";
import UserJourney from "@/models/UserJourney";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const user = await AdminUser.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Default to epoch if timestamps are somehow missing
    const lastViewedComments = user.lastViewedComments || new Date(0);
    const lastViewedChat = user.lastViewedChat || new Date(0);
    const lastViewedJourneys = user.lastViewedJourneys || new Date(0);

    const [comments, chat, journeys, messages] = await Promise.all([
      Comment.countDocuments({ createdAt: { $gt: lastViewedComments } }),
      ChatMessage.countDocuments({ timestamp: { $gt: lastViewedChat } }),
      UserJourney.countDocuments({ createdAt: { $gt: lastViewedJourneys } }),
      ContactMessage.countDocuments({ status: "pending" }), // Messages use explicit 'pending' status
    ]);

    return NextResponse.json({
      badges: {
        comments,
        chat,
        journeys,
        messages,
      },
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

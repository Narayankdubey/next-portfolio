import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Fetch chat history for this user, sorted by timestamp
    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: 1 })
      .select("message response timestamp -_id")
      .lean();

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error("Chat history API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to load chat history" },
      { status: 500 }
    );
  }
}

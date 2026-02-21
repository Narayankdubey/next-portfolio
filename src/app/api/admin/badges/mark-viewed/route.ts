import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

const validSections = ["comments", "chat", "journeys"];

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { section } = body;

    if (!section || !validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    await dbConnect();

    const updateField =
      section === "comments"
        ? "lastViewedComments"
        : section === "chat"
          ? "lastViewedChat"
          : "lastViewedJourneys";

    await AdminUser.findByIdAndUpdate(decoded.userId, {
      $set: { [updateField]: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking section as viewed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

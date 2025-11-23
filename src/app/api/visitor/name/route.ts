import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VisitorStats from "@/models/VisitorStats";

// POST /api/visitor/name - Update visitor name
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, name } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Update or create VisitorStats with name
    const updated = await VisitorStats.findOneAndUpdate(
      { userId },
      { name: name.trim() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: { name: updated.name },
    });
  } catch (error) {
    console.error("Update visitor name error:", error);
    return NextResponse.json({ success: false, error: "Failed to update name" }, { status: 500 });
  }
}

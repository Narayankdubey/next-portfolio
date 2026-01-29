import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserJourney from "@/models/UserJourney";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication (simplified - update with your auth logic)
    // const authResult = await verifyAuth(request);
    // if (!authResult.authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await dbConnect();

    const { id } = await params;

    const journey = await UserJourney.findOne({ sessionId: id }).select("-__v").lean();

    if (!journey) {
      return NextResponse.json({ error: "Journey not found" }, { status: 404 });
    }

    return NextResponse.json({ journey });
  } catch (error) {
    console.error("Get journey error:", error);
    return NextResponse.json({ error: "Failed to fetch journey" }, { status: 500 });
  }
}

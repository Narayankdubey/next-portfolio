import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import VisitorStats from "@/models/VisitorStats";

export async function GET() {
  try {
    await dbConnect();

    // Get total visits (sum of all visitCounts)
    const result = await VisitorStats.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: "$visitCount" },
          uniqueVisitors: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || { totalVisits: 0, uniqueVisitors: 0 };

    return NextResponse.json({
      totalVisits: stats.totalVisits,
      uniqueVisitors: stats.uniqueVisitors,
    });
  } catch (error) {
    console.error("Total visits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

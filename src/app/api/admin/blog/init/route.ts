import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// GET /api/admin/blog/init - Initialize isVisible for all existing blogs
export async function GET() {
  try {
    await dbConnect();

    // Update all blogs without isVisible to have isVisible: true
    const result = await BlogPost.updateMany(
      { isVisible: { $exists: false } },
      { $set: { isVisible: true } }
    );

    // Get count of all blogs
    const total = await BlogPost.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Initialized ${result.modifiedCount} blogs. Total: ${total}`,
      modifiedCount: result.modifiedCount,
      totalBlogs: total,
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

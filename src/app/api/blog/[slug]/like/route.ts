import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// POST /api/blog/[slug]/like - Increment like count
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    // Increment like count
    const updated = await BlogPost.findOneAndUpdate(
      { slug },
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { likeCount: updated.likeCount },
    });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json({ success: false, error: "Failed to process like" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// POST /api/blog/[slug]/view - Increment view count
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

    // Increment view count
    const updated = await BlogPost.findOneAndUpdate(
      { slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { viewCount: updated.viewCount },
    });
  } catch (error) {
    console.error("View increment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}

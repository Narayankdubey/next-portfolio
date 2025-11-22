import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// GET /api/blog/[id] - returns full content for internal posts only
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    const post = await BlogPost.findById(id).lean();
    if (!post) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    if (post.type !== "internal") {
      return NextResponse.json(
        { success: false, error: "External blog posts are not viewable internally" },
        { status: 400 }
      );
    }
    const { __v, _id, ...rest } = post as any;
    return NextResponse.json({
      success: true,
      data: {
        id: _id,
        ...rest,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Public blog detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

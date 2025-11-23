import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// GET /api/blog/[slug] - returns full content for internal posts only
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findOne({ slug }).lean();
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

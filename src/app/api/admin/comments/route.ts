import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import BlogPost from "@/models/BlogPost";

// GET /api/admin/comments - List all comments with blog context
export async function GET() {
  try {
    await dbConnect();

    // Get all comments with blog post details
    const comments = await Comment.find().sort({ createdAt: -1 }).lean();

    // Get blog titles for context
    const blogIds = [...new Set(comments.map((c) => c.blogId.toString()))];
    const blogs = await BlogPost.find({ _id: { $in: blogIds } }).lean();
    const blogMap = new Map(blogs.map((b: any) => [b._id.toString(), b.title]));

    const enriched = comments.map((c: any) => ({
      id: c._id.toString(),
      blogId: c.blogId.toString(),
      blogTitle: blogMap.get(c.blogId.toString()) || "Unknown Blog",
      content: c.content,
      isVisible: c.isVisible,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Admin get comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/comments - Update comment visibility
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { commentId, isVisible } = await request.json();

    if (!commentId || typeof isVisible !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await Comment.findByIdAndUpdate(commentId, { isVisible }, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { isVisible: updated.isVisible } });
  } catch (error) {
    console.error("Admin update comment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

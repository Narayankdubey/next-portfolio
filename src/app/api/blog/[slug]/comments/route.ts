import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import BlogPost from "@/models/BlogPost";

// GET /api/blog/[slug]/comments - Get approved comments for a blog post
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

    // Find blog by slug to get ID
    const blog = await BlogPost.findOne({ slug }).select("_id");
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    // Get only visible comments
    const comments = await Comment.find({
      blogId: blog._id,
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get unique userIds for fallback
     
    const userIds = [...new Set(comments.map((c: any) => c.userId).filter(Boolean))];

    // Fetch names from VisitorStats for fallback
    const VisitorStats = (await import("@/models/VisitorStats")).default;
    const visitors = await VisitorStats.find({ userId: { $in: userIds } }).lean();
    const nameMap = new Map(visitors.map((v: any) => [v.userId, v.name || null]));

     
    const cleaned = comments.map((c: any) => ({
      id: c._id.toString(),
      content: c.content,
      authorName: c.authorName || (c.userId ? nameMap.get(c.userId) : null) || "Anonymous",
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: cleaned });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/blog/[slug]/comments - Submit comment
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

    // Find blog by slug to get ID
    const blog = await BlogPost.findOne({ slug }).select("_id");
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    const { content, userId, authorName } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Comment too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Create comment (isVisible defaults to false)
    const comment = await Comment.create({
      blogId: blog._id,
      content: content.trim(),
      userId: userId || undefined,
      authorName: authorName ? authorName.trim() : undefined,
    });

    // If userId is provided and authorName is present, update VisitorStats as well for consistency
    if (userId && authorName && authorName.trim()) {
      // Import VisitorStats dynamically to avoid circular dependency issues if any
      const VisitorStats = (await import("@/models/VisitorStats")).default;
      await VisitorStats.findOneAndUpdate(
        { userId },
        { name: authorName.trim() },
        { upsert: false } // Only update if visitor exists
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment submitted successfully. It will be visible after admin approval.",
      data: { id: comment._id },
    });
  } catch (error) {
    console.error("Submit comment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit comment" },
      { status: 500 }
    );
  }
}

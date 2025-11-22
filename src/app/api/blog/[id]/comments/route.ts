import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";

// GET /api/blog/[id]/comments - Get approved comments for a blog post
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    // Get only visible comments
    const comments = await Comment.find({
      blogId: id,
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const cleaned = comments.map((c: any) => ({
      id: c._id.toString(),
      content: c.content,
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

// POST /api/blog/[id]/comments - Submit anonymous comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    const { content } = await request.json();

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
      blogId: id,
      content: content.trim(),
    });

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

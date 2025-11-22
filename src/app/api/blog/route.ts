import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Comment from "@/models/Comment";

// GET /api/blog - public list (only visible blogs)
export async function GET() {
  try {
    await dbConnect();
    // Only show blogs where isVisible is explicitly true
    const posts = await BlogPost.find({ isVisible: true }).lean();

    // Get comment counts for each blog
    const blogIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { blogId: { $in: blogIds }, isVisible: true } },
      { $group: { _id: "$blogId", count: { $sum: 1 } } },
    ]);
    const commentMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

    const cleaned = posts.map((p: any) => {
      const { __v, _id, createdAt, updatedAt, content, isVisible, ...rest } = p;
      return {
        id: _id,
        ...rest,
        createdAt: createdAt.toISOString(),
        commentCount: commentMap.get(_id.toString()) || 0,
      };
    });
    return NextResponse.json({ success: true, data: cleaned });
  } catch (error) {
    console.error("Public blog list error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

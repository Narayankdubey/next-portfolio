import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// Define input shape for a blog post
interface BlogPostInput {
  title: string;
  description?: string;
  content: string;
  type?: "internal" | "external";
  externalUrl?: string;
  thumbnailUrl?: string;
  isVisible?: boolean;
  likeCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// GET - list all blog posts (admin view)
export async function GET() {
  try {
    await dbConnect();
    const posts = await BlogPost.find().lean();
    // Remove MongoDB internal fields
    const cleaned = posts.map((p: any) => {
      const { __v, _id, createdAt, updatedAt, ...rest } = p;
      return { id: _id, ...rest };
    });
    return NextResponse.json({ success: true, data: cleaned });
  } catch (error) {
    console.error("Admin blog GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST - create a new blog post
export async function POST(request: Request) {
  try {
    await dbConnect();
    const payload = await request.json();
    // Accept either a single blog object or an array under `posts`
    const postsArray: BlogPostInput[] = Array.isArray(payload.posts)
      ? payload.posts
      : payload
        ? [payload]
        : [];
    if (postsArray.length === 0) {
      return NextResponse.json({ success: false, error: "No blog data provided" }, { status: 400 });
    }
    // Prepare documents with defaults
    const docs = postsArray.map((p) => ({
      title: p.title,
      description: p.description,
      content: p.content,
      type: p.type ?? "internal",
      externalUrl: p.externalUrl,
      thumbnailUrl: p.thumbnailUrl,
      isVisible: p.isVisible !== undefined ? p.isVisible : true,
      likeCount: p.likeCount ?? 0,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    }));
    const inserted = await BlogPost.insertMany(docs);
    const ids = inserted.map((d) => d._id);
    return NextResponse.json(
      { success: true, insertedCount: inserted.length, ids },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin blog POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// PUT - update an existing blog post (expects id in query param)
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    console.log("[PUT] Blog ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id query parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("[PUT] Request body:", JSON.stringify(body));

    // Update the document - don't use .lean() to ensure Mongoose processes the update properly
    const updated = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: false });

    console.log("[PUT] Updated result:", updated ? "Success" : "Not found");
    if (updated) {
      console.log("[PUT] isVisible after update:", updated.isVisible);
      console.log("[PUT] Full updated doc:", JSON.stringify(updated.toObject()));
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    // Convert to plain object
    const plainDoc = updated.toObject();
    const { __v, _id, createdAt, updatedAt, ...rest } = plainDoc as any;

    return NextResponse.json({ success: true, data: { id: _id.toString(), ...rest } });
  } catch (error) {
    console.error("Admin blog PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE - delete a blog post (expects id in query param)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id query parameter" },
        { status: 400 }
      );
    }
    const result = await BlogPost.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Blog post deleted" });
  } catch (error) {
    console.error("Admin blog DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}

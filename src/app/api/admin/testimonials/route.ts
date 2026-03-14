import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { revalidatePath } from "next/cache";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

// Middleware helper to check auth
async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) return false;
  try {
    jwt.verify(token.value, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const portfolio = await Portfolio.findOne();

    if (!portfolio) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: portfolio.testimonials || [] });
  } catch (error) {
    console.error("[Testimonials GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testimonials } = await request.json();

    if (!Array.isArray(testimonials)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await dbConnect();
    const portfolio = await Portfolio.findOne();

    if (portfolio) {
      portfolio.testimonials = testimonials;
      await portfolio.save();
    } else {
      // Small fallback if portfolio doesn't exist, though it should
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Revalidate paths
    revalidatePath("/", "layout");
    revalidatePath("/api/portfolio");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Testimonials PUT] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";

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
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: portfolio });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newData = await request.json();

    // Validate structure (basic check)
    if (!newData.personal || !newData.skills || !newData.projects) {
      return NextResponse.json({ error: "Invalid data structure" }, { status: 400 });
    }

    await dbConnect();

    // Remove system fields that shouldn't be manually updated
    delete newData._id;
    delete newData.createdAt;
    delete newData.updatedAt;
    delete newData.__v;

    // Update or create if not exists
    // We assume there's only one portfolio document
    const portfolio = await Portfolio.findOne();

    if (portfolio) {
      Object.assign(portfolio, newData);
      await portfolio.save();
    } else {
      await Portfolio.create(newData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

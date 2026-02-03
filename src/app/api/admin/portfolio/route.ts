import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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

    const portfolioData = portfolio.toObject();

    // Ensure resumeUrl field is always present
    if (!portfolioData.resumeUrl) {
      portfolioData.resumeUrl = "";
    }

    console.log(
      "[Portfolio GET] Returning portfolio with resumeUrl:",
      portfolioData.resumeUrl || "(empty)"
    );

    return NextResponse.json({ data: portfolioData });
  } catch (error) {
    console.error("[Portfolio GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newData = await request.json();

    console.log("[Portfolio Update] Received data:", JSON.stringify(newData, null, 2));

    // Only validate structure if this looks like a full portfolio update
    // Allow partial updates for fields like resumeUrl
    const isFullUpdate = newData.personal && newData.skills && newData.projects;

    if (!isFullUpdate && Object.keys(newData).length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
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
      console.log("[Portfolio Update] BEFORE save - resumeUrl:", portfolio.resumeUrl);

      const saveResult = await portfolio.save();
      console.log("[Portfolio Update] AFTER save - resumeUrl:", saveResult.resumeUrl);

      // Verify it's actually in the DB
      const verification = await Portfolio.findById(portfolio._id);
      console.log("[Portfolio Update] VERIFICATION from DB - resumeUrl:", verification?.resumeUrl);
      console.log(
        "[Portfolio Update] Full verification object:",
        JSON.stringify(verification, null, 2)
      );
    } else {
      console.log("[Portfolio Update] Creating new portfolio");
      await Portfolio.create(newData);
    }

    // Revalidate the portfolio cache so changes appear immediately
    revalidatePath("/", "layout");
    revalidatePath("/api/portfolio");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Portfolio Update] Error:", error);
    console.error("[Portfolio Update] Error details:", error.message);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

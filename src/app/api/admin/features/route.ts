import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import FeatureFlags from "@/models/FeatureFlags";

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

    const flags = await FeatureFlags.findOne().lean();

    if (!flags) {
      // Return default structure if no flags exist in database
      return NextResponse.json({
        data: {
          sections: {},
          features: {},
          userCustomizable: { sections: [], features: [] },
          devMode: { showFeatureToggles: false, enableDebugLogs: false },
        },
      });
    }

    // Remove MongoDB-specific fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { __v, _id, createdAt, updatedAt, ...flagsData } = flags as any;

    return NextResponse.json({ data: flagsData });
  } catch (error) {
    console.error("Feature flags fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch feature flags",
        data: {
          sections: {},
          features: {},
          userCustomizable: { sections: [], features: [] },
          devMode: { showFeatureToggles: false, enableDebugLogs: false },
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const newData = await request.json();

    // Basic validation - only require features and sections
    if (!newData.features || !newData.sections) {
      return NextResponse.json(
        { error: "Invalid data structure - features and sections are required" },
        { status: 400 }
      );
    }

    // Find existing flags or create new one
    const flags = await FeatureFlags.findOne();

    if (!flags) {
      // Create new document if none exists
      const newFlags = await FeatureFlags.create(newData);
      return NextResponse.json({
        success: true,
        message: "Feature flags created successfully",
        data: newFlags,
      });
    }

    // Update existing document
    const updated = await FeatureFlags.findByIdAndUpdate(flags._id, newData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Feature flags updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Feature flags update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

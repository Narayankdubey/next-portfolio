import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FeatureFlags from "@/models/FeatureFlags";

// Cache for 1 hour in production
// export const revalidate = process.env.NODE_ENV === "production" ? 3600 : 0;

export async function GET() {
  try {
    await dbConnect();

    const flags = await FeatureFlags.findOne().lean();

    if (!flags) {
      return NextResponse.json(
        { success: false, error: "Feature flags not found" },
        { status: 404 }
      );
    }

    // Remove MongoDB-specific fields

    const { __v, _id, ...flagsData } = flags as any;

    return NextResponse.json(
      {
        success: true,
        data: flagsData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// Optional: PUT endpoint for updating feature flags (admin use)
export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const flags = await FeatureFlags.findOne();

    if (!flags) {
      const newFlags = await FeatureFlags.create(body);
      return NextResponse.json({
        success: true,
        message: "Feature flags created successfully",
        data: newFlags,
      });
    }

    const updated = await FeatureFlags.findByIdAndUpdate(flags._id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Feature flags updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating feature flags:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update feature flags" },
      { status: 500 }
    );
  }
}

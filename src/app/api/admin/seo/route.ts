import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SEOSettings from "@/models/SEOSettings";

export async function GET() {
  try {
    await dbConnect();

    // Find the single configuration document
    const settings = (await (SEOSettings as any).findOne().lean()) as any;

    // Create default if none exists
    if (!settings) {
      const defaultSettings = new SEOSettings({});
      await defaultSettings.save();
      return NextResponse.json({ settings: defaultSettings.toObject() }, { status: 200 });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const allowedUpdates = [
      "title",
      "description",
      "keywords",
      "ogTitle",
      "ogDescription",
      "ogImage",
      "twitterHandle",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Find then update to avoid union type issues
    const existing = await (SEOSettings as any).findOne();

    let settings;
    if (!existing) {
      settings = new SEOSettings(updateData);
      await settings.save();
    } else {
      settings = await (SEOSettings as any).findByIdAndUpdate(
        existing._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json(
      { message: "SEO settings updated successfully", settings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating SEO settings:", error);
    return NextResponse.json({ error: "Failed to update SEO settings" }, { status: 500 });
  }
}

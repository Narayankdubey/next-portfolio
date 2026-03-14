import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AISettings from "@/models/AISettings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await (AISettings as any).findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await (AISettings as any).create({
        systemPrompt: "",
        customKnowledge: "",
        isActive: true,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();

    let settings = await (AISettings as any).findOne();

    if (settings) {
      settings.systemPrompt = data.systemPrompt ?? settings.systemPrompt;
      settings.customKnowledge = data.customKnowledge ?? settings.customKnowledge;
      settings.isActive = data.isActive ?? settings.isActive;
      await settings.save();
    } else {
      settings = await (AISettings as any).create(data);
    }

    return NextResponse.json({ settings, success: true });
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

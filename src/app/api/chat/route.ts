import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import ChatMessage from "@/models/ChatMessage";
import { generateAIResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required", message: "Please provide a valid message" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required", message: "Please provide a valid user ID" },
        { status: 400 }
      );
    }

    // Connect to database and fetch portfolio data
    await dbConnect();
    const portfolio = await Portfolio.findOne();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio data not found", message: "Unable to access portfolio information" },
        { status: 500 }
      );
    }

    // Generate response - try AI first, fallback to keyword matching
    let response: string;
    try {
      response = await generateAIResponse(message, portfolio);
    } catch (aiError) {
      console.log("AI generation failed, using fallback:", aiError);
      // Fallback to keyword matching
      response = generateFallbackResponse(message, portfolio);
    }

    const timestamp = new Date();

    // Save message and response to database
    await ChatMessage.create({
      userId,
      message,
      response,
      timestamp,
    });

    return NextResponse.json({
      response,
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(query: string, portfolio: any): string {
  const q = query.toLowerCase();

  if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    return "Hello! How can I help you today?";
  }

  if (q.includes("skill") || q.includes("tech") || q.includes("stack")) {
    return `Narayan is proficient in Frontend (${portfolio.skills.frontend.slice(0, 3).join(", ")}...), Backend (${portfolio.skills.backend.slice(0, 3).join(", ")}...), and various tools. Check out the Skills section for more!`;
  }

  if (q.includes("experience") || q.includes("work") || q.includes("job")) {
    return `He is currently working at ${portfolio.experience[0].company} as a ${portfolio.experience[0].role}. Before that, he was at ${portfolio.experience[1]?.company || "another company"}.`;
  }

  if (q.includes("project") || q.includes("built")) {
    return `Some of his key projects include ${portfolio.projects[0].title} (${portfolio.projects[0].description}) and ${portfolio.projects[1]?.title || "others"}. You can see them in the Projects section.`;
  }

  if (q.includes("contact") || q.includes("email") || q.includes("reach")) {
    return `You can reach him at ${portfolio.personal.email} or connect on LinkedIn!`;
  }

  if (q.includes("location") || q.includes("where")) {
    return `He is based in ${portfolio.personal.location}.`;
  }

  return "I'm not sure about that, but you can explore the portfolio to find out more! Or try asking about skills, experience, or projects.";
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize Gemini AI
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateAIResponse(message: string, portfolioData: any): Promise<string> {
  if (!genAI || !API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    // Build portfolio context
    const context = buildPortfolioContext(portfolioData);

    // System prompt
    const systemPrompt = `You are an AI assistant for ${portfolioData.personal.name}'s portfolio website.
Your role is to answer questions ONLY about ${portfolioData.personal.name} based on the provided portfolio data.
Be helpful, concise, and professional. Keep responses under 100 words.
If asked about something not in the portfolio data, politely say you don't have that information.`;

    // Combine prompt
    const fullPrompt = `${systemPrompt}

Portfolio Data:
${context}

User Question: ${message}

Answer:`;

    // Generate response (try without models/ prefix first)
    console.log("Attempting AI generation...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log("AI generation successful!");

    return text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

function buildPortfolioContext(portfolio: any): string {
  const context = `
Name: ${portfolio.personal.name}
Role: ${portfolio.personal.role}
Location: ${portfolio.personal.location}
Email: ${portfolio.personal.email}

Bio: ${portfolio.personal.bio}

Skills:
Frontend: ${portfolio.skills.frontend.join(", ")}
Backend: ${portfolio.skills.backend.join(", ")}
Tools: ${portfolio.skills.tools?.join(", ") || "N/A"}

Experience:
${portfolio.experience
  .map(
    (exp: any, idx: number) => `
${idx + 1}. ${exp.role} at ${exp.company}
   Duration: ${exp.duration}
   ${exp.description}
   Achievements: ${exp.highlights?.join("; ") || "N/A"}
`
  )
  .join("\n")}

Projects:
${portfolio.projects
  .map(
    (proj: any, idx: number) => `
${idx + 1}. ${proj.title}
   Description: ${proj.description}
   Technologies: ${proj.technologies?.join(", ") || "N/A"}
`
  )
  .join("\n")}

Education:
${
  portfolio.education
    ?.map(
      (edu: any) => `
${edu.degree} from ${edu.institution} (${edu.year})
`
    )
    .join("\n") || "N/A"
}
`.trim();

  return context;
}

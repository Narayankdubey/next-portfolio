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
Personal Information:
Name: ${portfolio.personal.name}
Role: ${portfolio.personal.title}
Tagline: ${portfolio.personal.tagline}
Location: ${portfolio.personal.location}
Email: ${portfolio.personal.email}
Phone: ${portfolio.personal.phone}
Website: ${portfolio.personal.website}
Resume: ${portfolio.resumeUrl || "Not available"}

Social Links:
GitHub: ${portfolio.social.github}
LinkedIn: ${portfolio.social.linkedin}
Email: ${portfolio.social.email}

Bio:
${portfolio.about.bio.join("\n")}

Skills:
Frontend: ${portfolio.skills.frontend.join(", ")}
Backend: ${portfolio.skills.backend.join(", ")}
Tools: ${portfolio.skills.tools.join(", ")}
Other: ${portfolio.skills.other.join(", ")}

Experience:
${portfolio.experience
  .map(
    (exp: any, idx: number) => `
${idx + 1}. ${exp.role} at ${exp.company} (${exp.type})
   Period: ${exp.period}
   Description:
   ${exp.description.join("\n   ")}
`
  )
  .join("\n")}

Projects:
${portfolio.projects
  .map(
    (proj: any, idx: number) => `
${idx + 1}. ${proj.title}
   Description: ${proj.description}
   Tags: ${proj.tags.join(", ")}
   GitHub: ${proj.github}
   Demo: ${proj.demo}
   ${proj.playStoreUrl ? `Play Store: ${proj.playStoreUrl}` : ""}
   ${proj.appStoreUrl ? `App Store: ${proj.appStoreUrl}` : ""}
`
  )
  .join("\n")}

Education:
${
  portfolio.education
    ?.map(
      (edu: any) => `
${edu.degree} from ${edu.institution}
   Location: ${edu.location}
   Period: ${edu.period}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ""}
`
    )
    .join("\n") || "N/A"
}

Awards & Achievements:
Awards: ${portfolio.awards?.join(", ") || "None"}
Achievements:
${
  portfolio.achievements
    ?.filter((a: any) => a.unlocked)
    .map((a: any) => `- ${a.title}: ${a.description}`)
    .join("\n") || "None"
}

Testimonials:
${
  portfolio.testimonials?.map((t: any) => `- "${t.text}" — ${t.name}, ${t.role}`).join("\n") ||
  "None"
}

Hobbies: ${portfolio.hobbies?.join(", ") || "N/A"}
`.trim();

  return context;
}

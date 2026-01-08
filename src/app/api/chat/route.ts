import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a friendly Campus Assistant AI for college students. Help with:
- Academic questions and study tips
- Course-related queries  
- Campus navigation and resources
- Time management and productivity
- Career guidance

Be concise (under 100 words). Use a warm, supportive tone.`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES: Record<string, string> = {
  study: "Here are some quick study tips: 1) Use the Pomodoro technique - 25 min focus, 5 min break. 2) Teach concepts to others to solidify understanding. 3) Create a distraction-free environment. 4) Review notes within 24 hours of class. Good luck with your studies! 📚",
  exam: "For exam prep: Start early, create a study schedule, practice with past papers, get enough sleep, and stay hydrated. You've got this! 💪",
  time: "Time management tips: Prioritize tasks using the Eisenhower matrix, block dedicated study time, limit social media, and take regular breaks to stay fresh.",
  help: "I can help you with study tips, exam preparation, time management, course questions, and campus resources. What would you like to know?",
  default: "I'm your Campus Assistant! I can help with studying, time management, exams, and more. Try asking me for study tips or exam advice!",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("study") || lower.includes("tip")) return FALLBACK_RESPONSES.study;
  if (lower.includes("exam") || lower.includes("test")) return FALLBACK_RESPONSES.exam;
  if (lower.includes("time") || lower.includes("schedule")) return FALLBACK_RESPONSES.time;
  if (lower.includes("help") || lower.includes("what")) return FALLBACK_RESPONSES.help;
  return FALLBACK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found - using fallback");
      return NextResponse.json({ response: getFallbackResponse(message) });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Try with exponential backoff for rate limits
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `${SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`,
          });

          const text = response.text;
          
          if (text) {
            return NextResponse.json({ response: text });
          }
        } catch (err: unknown) {
          const error = err as { status?: number; message?: string };
          console.log(`Model ${model} attempt ${attempt + 1} failed:`, error.status || error.message);
          
          if (error.status === 429) {
            // Rate limited - wait and retry with backoff
            await delay(2000 * (attempt + 1));
            continue;
          }
          break; // Other errors, try next model
        }
      }
    }

    // All attempts failed - use fallback
    console.log("All API attempts exhausted, using fallback response");
    return NextResponse.json({ response: getFallbackResponse(message) });
    
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const err = error as { message?: string };
    
    // Return fallback instead of error
    const { message } = await request.json().catch(() => ({ message: "" }));
    return NextResponse.json({ 
      response: getFallbackResponse(message || ""),
      note: "Using cached response" 
    });
  }
}

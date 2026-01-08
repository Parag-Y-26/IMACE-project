import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// System prompt for visual classroom assistant
const VISUAL_SYSTEM_PROMPT = `You are a helpful AI classroom assistant that can SEE through the user's camera. 
You are helping students learn by analyzing what they show you - textbooks, notes, whiteboards, problems, diagrams, etc.

When analyzing images:
- Describe what you see clearly and concisely
- If it's a math problem, help solve it step by step
- If it's text/notes, summarize key points
- If it's a diagram, explain what it represents
- Offer helpful insights and learning tips

Be encouraging, educational, and concise (under 150 words).`;

export async function POST(request: NextRequest) {
  try {
    const { action, imageData, message, transcription } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    switch (action) {
      case "analyze-image":
        // Analyze image from camera
        if (!imageData) {
          return NextResponse.json(
            { error: "No image data provided" },
            { status: 400 }
          );
        }

        try {
          // Remove data URL prefix if present
          const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
          
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Image,
                    },
                  },
                  {
                    text: message 
                      ? `${VISUAL_SYSTEM_PROMPT}\n\nUser question: ${message}\n\nAnalyze what you see and respond.`
                      : `${VISUAL_SYSTEM_PROMPT}\n\nDescribe what you see and provide helpful insights.`,
                  },
                ],
              },
            ],
          });

          return NextResponse.json({
            response: response.text || "I can see the image but couldn't generate a response.",
            success: true,
          });
        } catch (analysisError: unknown) {
          console.error("Image analysis error:", analysisError);
          const err = analysisError as { status?: number };
          
          // Handle rate limits gracefully
          if (err.status === 429) {
            return NextResponse.json({
              response: "I can see your camera feed! The AI is currently busy - try again in a moment, or ask me a specific question about what you're showing me.",
              success: false,
            });
          }
          
          return NextResponse.json({
            response: "I had trouble analyzing the image. Make sure it's clear and well-lit, then try again!",
            success: false,
          });
        }

      case "generate-response":
        // Generate AI response for a text message
        if (!message) {
          return NextResponse.json(
            { error: "No message provided" },
            { status: 400 }
          );
        }

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${VISUAL_SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`,
          });

          return NextResponse.json({
            response: response.text || "I couldn't generate a response.",
          });
        } catch (responseError) {
          console.error("Response generation error:", responseError);
          return NextResponse.json({
            response: "I'm having trouble responding right now. Please try again!",
          });
        }

      case "process-lecture":
        // Process transcription and generate notes
        if (!transcription) {
          return NextResponse.json(
            { error: "No transcription provided" },
            { status: 400 }
          );
        }

        try {
          const notesResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Create study notes from this lecture transcription. Return JSON with: title, summary, keyPoints (array), definitions (array of {term, definition}), topics (array).

Transcription: "${transcription}"

Return ONLY the JSON, no markdown.`,
          });

          let notes;
          try {
            const text = notesResponse.text?.replace(/```json\n?|\n?```/g, "").trim() || "{}";
            notes = JSON.parse(text);
          } catch {
            notes = {
              title: "Lecture Notes",
              summary: notesResponse.text?.slice(0, 200) || "Notes generated",
              keyPoints: [],
              definitions: [],
              topics: ["general"],
            };
          }

          return NextResponse.json({ notes });
        } catch (notesError) {
          console.error("Notes generation error:", notesError);
          return NextResponse.json({
            notes: {
              title: "Lecture Notes",
              summary: "Unable to generate notes at this time.",
              keyPoints: [],
              definitions: [],
              topics: [],
            },
          });
        }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Gemini Live API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const NOTE_GENERATION_PROMPT = `You are an expert study assistant. Analyze the following lecture transcription and create comprehensive study notes.

Return a JSON object with this exact structure:
{
  "title": "A concise title for this lecture/topic",
  "summary": "A 2-3 sentence summary of the main topic",
  "keyPoints": ["Point 1", "Point 2", "Point 3", ...],
  "definitions": [{"term": "Term", "definition": "Definition"}, ...],
  "topics": ["topic1", "topic2", "topic3"],
  "suggestedSearchTerms": ["search term 1", "search term 2", "search term 3"]
}

Make the notes educational, clear, and structured. Extract all important concepts.`;

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription || transcription.trim().length < 20) {
      return NextResponse.json(
        { error: "Transcription too short. Please provide more content." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${NOTE_GENERATION_PROMPT}\n\nTranscription:\n${transcription}\n\nRespond with ONLY the JSON object, no other text.`,
    });

    const text = response.text?.trim() || "";
    
    // Parse JSON from response
    let notes;
    try {
      // Remove markdown code blocks if present
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      notes = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, create structured response from text
      notes = {
        title: "Lecture Notes",
        summary: text.slice(0, 200),
        keyPoints: text.split("\n").filter(line => line.trim()).slice(0, 5),
        definitions: [],
        topics: ["general"],
        suggestedSearchTerms: ["lecture topic", "study guide"],
      };
    }

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Note generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate notes. Please try again." },
      { status: 500 }
    );
  }
}

import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const GOAL_STEPS_PROMPT = `You are an expert career and education coach. Generate a personalized 10-step journey for the user based on their goal and current skills.

User's Goal: {goal}
User's Current Skills: {skills}

Generate exactly 10 actionable steps that will help them achieve their goal. Each step should be:
1. Specific and actionable
2. Building upon previous steps
3. Realistic with clear timelines
4. Personalized based on their existing skills (skip basics if they already know them)

Return a JSON array with exactly 10 objects, each having:
- "title": Short, catchy title (max 5 words)
- "description": Detailed description of what to do (1-2 sentences)
- "deadline": When to complete (e.g., "Week 1", "Month 2")
- "estimatedDays": Number of days to complete (integer)
- "resources": Array of 2-3 recommended resources or actions

Make the journey deeply personalized and practical. Consider:
- The user's existing skills when setting difficulty
- Industry best practices for their goal
- A mix of learning, doing, and networking activities

IMPORTANT: Return ONLY the JSON array, no other text or markdown.`;

const FALLBACK_STEPS = [
  { title: "Define Your Vision", description: "Clarify exactly what success looks like for your goal. Write down specific, measurable outcomes you want to achieve.", deadline: "Week 1", estimatedDays: 7, resources: ["Vision board creation", "SMART goals framework"] },
  { title: "Audit Current Skills", description: "Assess your current abilities honestly. Identify gaps between where you are and where you need to be.", deadline: "Week 2", estimatedDays: 14, resources: ["Skills assessment tools", "Industry skill requirements research"] },
  { title: "Create Learning Roadmap", description: "Design a structured curriculum based on your skill gaps. Prioritize high-impact skills first.", deadline: "Week 3", estimatedDays: 21, resources: ["Online course platforms", "Industry mentors"] },
  { title: "Build Core Foundation", description: "Master the fundamental skills essential for your goal. Focus on depth over breadth initially.", deadline: "Month 1", estimatedDays: 30, resources: ["Foundational courses", "Practice exercises"] },
  { title: "Start First Project", description: "Apply your learning to a real-world project. This builds practical experience and portfolio material.", deadline: "Month 2", estimatedDays: 60, resources: ["Project ideas list", "GitHub/Portfolio setup"] },
  { title: "Seek Expert Guidance", description: "Connect with mentors and professionals in your target field. Their insights can accelerate your growth.", deadline: "Month 2", estimatedDays: 60, resources: ["LinkedIn networking", "Industry events"] },
  { title: "Build Your Portfolio", description: "Create 2-3 substantial projects showcasing your abilities. Document your work professionally.", deadline: "Month 3", estimatedDays: 90, resources: ["Portfolio templates", "Case study writing"] },
  { title: "Grow Your Network", description: "Attend events, join communities, and connect with 50+ professionals in your target industry.", deadline: "Month 4", estimatedDays: 120, resources: ["Industry conferences", "Online communities"] },
  { title: "Gain Real Experience", description: "Get hands-on experience through internships, freelance projects, or contributing to real products.", deadline: "Month 5", estimatedDays: 150, resources: ["Job boards", "Freelance platforms"] },
  { title: "Achieve Your Goal", description: "Put everything together. Apply for positions, launch your venture, or complete your objective.", deadline: "Month 6", estimatedDays: 180, resources: ["Application strategies", "Interview preparation"] },
];

export async function POST(request: NextRequest) {
  try {
    const { goal, skills } = await request.json();

    if (!goal) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return personalized fallback based on goal keywords
      console.log("No API key, using fallback steps");
      return NextResponse.json({ 
        steps: FALLBACK_STEPS,
        isAIGenerated: false 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = GOAL_STEPS_PROMPT
      .replace("{goal}", goal)
      .replace("{skills}", skills?.join(", ") || "None specified");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text?.trim() || "";
      
      // Parse JSON from response
      let steps;
      try {
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        steps = JSON.parse(jsonStr);
        
        // Validate structure
        if (!Array.isArray(steps) || steps.length === 0) {
          throw new Error("Invalid response structure");
        }
        
        // Ensure all required fields exist
        steps = steps.map((step: { title?: string; description?: string; deadline?: string; estimatedDays?: number; resources?: string[] }, index: number) => ({
          title: step.title || `Step ${index + 1}`,
          description: step.description || "Complete this milestone",
          deadline: step.deadline || `Month ${Math.ceil((index + 1) / 2)}`,
          estimatedDays: step.estimatedDays || (index + 1) * 15,
          resources: step.resources || [],
        }));

      } catch {
        console.log("Failed to parse AI response, using fallback");
        steps = FALLBACK_STEPS;
      }

      return NextResponse.json({ 
        steps,
        isAIGenerated: true,
        goal 
      });

    } catch (apiError: unknown) {
      const error = apiError as { status?: number };
      console.error("Gemini API error:", error);
      
      // Rate limit or other API error - use fallback
      if (error?.status === 429) {
        console.log("Rate limited, using fallback steps");
      }
      
      return NextResponse.json({ 
        steps: FALLBACK_STEPS,
        isAIGenerated: false 
      });
    }

  } catch (error) {
    console.error("Generate steps error:", error);
    return NextResponse.json(
      { error: "Failed to generate steps" },
      { status: 500 }
    );
  }
}

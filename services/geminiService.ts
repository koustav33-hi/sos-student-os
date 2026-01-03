
import { GoogleGenAI, Type } from "@google/genai";

export async function generateMicroTask(skill: string): Promise<string> {
  // Always use the API key directly from process.env.API_KEY per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate exactly one specific, actionable 30-60 minute micro-task for a student learning the skill: ${skill}. 
                 The task should be direct, no-fluff, and challenging. 
                 Format: A single sentence starting with a verb.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    // Directly access .text property from GenerateContentResponse
    return response.text?.trim() || "Complete a focused practice session.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Execute a 45-minute deep work session on your skill.";
  }
}

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'GEMINI API PASTE HERE' });

export async function parseTask(input: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this task description into a structured JSON object: "${input}"
      Current time: ${new Date().toISOString()}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              description: "One of: Work, Personal, Ideas, Health, Urgent"
            },
            priority: { 
              type: Type.STRING,
              description: "One of: High, Medium, Low"
            },
            due_at: { 
              type: Type.STRING,
              description: "ISO 8601 timestamp"
            }
          },
          required: ["title", "category", "priority"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Parsing failed:", error);
    return {
      title: input,
      category: "General",
      priority: "Medium",
      due_at: null
    };
  }
}

export async function generateWeeklyReport(tasks: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a weekly productivity report based on these completed tasks: ${JSON.stringify(tasks)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            insights: { type: Type.STRING },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "insights", "summary", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Report generation failed:", error);
    return null;
  }
}

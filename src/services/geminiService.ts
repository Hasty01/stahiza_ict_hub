import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ApprovalResult {
  approved: boolean;
  reason: string;
  suggestedTags?: string[];
  score: number; // 0-100
}

export const evaluateProjectWithAI = async (project: Project): Promise<ApprovalResult> => {
  const prompt = `
    You are an ICT Project Judge for the Stahiza ICT Hub.
    Evaluate the following student project submission for quality, technical depth, and relevance.
    
    Project Title: ${project.title}
    Student Name: ${project.studentName}
    Description: ${project.description}
    Tags: ${project.tags.join(", ")}
    Dependencies: ${project.dependencies?.join(", ") || "None listed"}
    
    Guidelines:
    1. A project should be approved if it demonstrates genuine effort, describes a technical implementation, or solves a school-related problem.
    2. Projects with vague or nonsensical descriptions should be rejected.
    3. Minimum score for approval is 50.
    
    Provide your judgment in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          },
          required: ["approved", "reason", "score"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as ApprovalResult;
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    // Fallback if AI fails
    return {
      approved: true,
      reason: "Automated approval fallback due to evaluation timeout.",
      score: 50
    };
  }
};

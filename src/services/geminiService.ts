/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface ParsedJob {
  title: string;
  company: string;
  requirements: string[];
  url?: string;
  sourceType?: 'URL' | 'Manual Input';
}

export async function parseJobDescription(content: string): Promise<ParsedJob> {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze the following job description and extract the official Job Title, the Company Name, and 8 to 12 most critical day-to-day responsibilities, hard skills, or minimum requirements.

Job Description Content:
${content}` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 8 to 12 core requirements or tasks."
          }
        },
        required: ["title", "company", "requirements"]
      }
    }
  });

  try {
    const parsed = JSON.parse(result.text);
    return parsed as ParsedJob;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to extract job details. Please try again.");
  }
}

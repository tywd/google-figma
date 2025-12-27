import { GoogleGenAI, Type } from "@google/genai";
import { NodeSchema, NodeType } from "../core/types";
import { v4 as uuidv4 } from 'uuid';

export const generateDesign = async (prompt: string): Promise<NodeSchema[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing. Please set it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a design for: "${prompt}". 
      Return a JSON array of shapes. 
      The coordinate system starts at x=0, y=0.
      Keep shapes within 800x600 area if possible.
      Use standard hex codes for colors.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: [NodeType.RECTANGLE, NodeType.CIRCLE, NodeType.TEXT] },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER, nullable: true },
              height: { type: Type.NUMBER, nullable: true },
              radius: { type: Type.NUMBER, nullable: true },
              fill: { type: Type.STRING },
              text: { type: Type.STRING, nullable: true },
              fontSize: { type: Type.NUMBER, nullable: true },
            },
            required: ['type', 'x', 'y', 'fill'],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawShapes = JSON.parse(jsonText);
    
    // Enrich with IDs and defaults
    return rawShapes.map((s: any) => ({
      ...s,
      id: uuidv4(),
      width: s.width ?? 100,
      height: s.height ?? 100,
      radius: s.radius ?? 50,
      fontSize: s.fontSize ?? 16,
      text: s.text ?? '',
    }));

  } catch (error) {
    console.error("AI Generation Error", error);
    throw error;
  }
};